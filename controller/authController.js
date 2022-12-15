const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

//*@desc    Login
//*@route   Post /auth
//*@access  Public

const login = asyncHandler(async (req, res) => {
    //? Authentication: expect user to pass username and password
    const { username, password } = req.body

    //check if input is correct
    if (!username || !password) {
        return res.status(400).json({ msg: 'All fields are required' })
    }

    //todo: Look for User in db
    const foundUser = await User.findOne({ username }).exec()

    //check if user is found and active
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ msg: 'Unauthorized!' })
    }

    //? if users password does match
    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(401).json({ msg: 'Unauthorized!' })

    //todo: create access token
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    //todo: create refresh token
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    //todo: create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //
        sameSite: 'None',// cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    //todo: send accessToken containing username and roles
    res.json({ accessToken })
})

//*@desc    Refresh
//*@route   GET /auth/refresh
//*@access  Public - because access token has expired

const refresh = (req, res) => {
    //? expect cookie from request
    const cookies = req.cookies

    //handle if no cookie
    if (!cookies?.jwt) return res.status(401).json({ msg: 'Unauthorized!' })

    //if we do have it, set it to refreshToken
    const refreshToken = cookies.jwt

    //verify this token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) res.status(403).json({ msg: 'Forbidden!' })

            //look for User and decode
            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ msg: 'Unauthorized!' })

            //todo: create a new accessToken
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )
            // send accessToken
            res.json({ accessToken })
        })
    )



}

//*@desc    Get all users notes
//*@route   GET /notes
//*@access  Public - just to clear cookie if exists

const logout = (req, res) => {
    //check for cookies
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content

    //clear cookie when user decides to manually log out
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login, refresh, logout
}