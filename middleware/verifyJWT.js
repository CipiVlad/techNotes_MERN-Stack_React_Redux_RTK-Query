//! middleware for protecting each route that should be secured

const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    //defining header: look out if there's a header (lower and -UpperCase)
    const authHeader = req.headers.authorization || req.headers.Authorization

    //Bearer Token Check
    if (!authHeader?.startsWith(`Bearer `)) {
        return res.status(401).json({ msg: 'Unauthorized!' })
    }

    // get Token
    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            //check for err
            if (err) return res.status(403).json({ msg: 'Forbidden!' })

            //otherwise we set: user and roles to UserInfo
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles
            next()// than move on to next middleware in-line or Controller
        }
    )
}

module.exports = verifyJWT