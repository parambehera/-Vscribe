import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://paramjyoti.kinde.com/.well-known/jwks.json",
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);

    if (!key) return callback(new Error("No signing key found"));

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export function requireAuth(req, res, next) {
  console.log("Authorization middleware triggered");
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("No token provided");

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");
     
    // ✅ Attach user info to the request
    req.user = decoded;
    next();
  });
}
