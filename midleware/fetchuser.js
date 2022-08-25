const jwt = require('jsonwebtoken');
const JWT_token = "hello!@#mynameisvansh"

const fetchuser = (req, res, next) => {
    const token = req.header("auth-token")
    if (!token) {
        res.status(401).send({ "error": "Please authenticate using valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_token)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401)
    }

}

module.exports = fetchuser