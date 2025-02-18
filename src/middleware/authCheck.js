const jwt = require("jsonwebtoken");
const { prisma } = require ("../../prisma/prisma");


// Check to make sure the request is coming from an authenticated user
exports.isAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "You must be logged in", auth: false });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ error: "You must be logged in", auth: false });
      }
      const { id } = payload;
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      })
      req.user = user;
      next()
    });
  } catch(error) {
    console.log(error);
    return res.status(500).json({ message: 'There was an error processing your request' });
  }
}

// Check to make sure the request is coming from a user who's role is 'admin'
exports.isAdmin = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "You must be logged in", auth: false });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ error: "You must be authenticated", auth: false });
      }
      const { id } = payload;
      await prisma.user.findUnique({
        where: {
          id,
        },
      }).then((userdata) => {
        if(userdata.isAdmin !== true ) {
          return res.status(403).json({ message: 'Forbidden' });
        } else {
          req.user = userdata;
          next();
        }
      });
    });
  } catch(error) {
    console.log(error);
    return res.status(500).json({ message: 'There was an error processing your request' });
  }
}