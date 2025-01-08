const router = require("express").Router();
const auth = require("./authprocess");

router.post("/change-password", async (req, res) => {
  let result = await auth.changePassword(req.body);
  res.json(result);
});

router.post("/request-otp", async (req, res) => {
  let result = await auth.requestOTP(req.body.email);
  res.json(result);
});

router.post("/verify-otp", async (req, res) => {
  const result = await auth.validateOTP(req.body.email, req.body.otp);
  res.json(result);
});

router.post("/verify-jwt", async (req, res) => {
  const result = await auth.verifyToken(req.body.token);
  res.json(result);
});

router.get("/getUser/:id", async (req, res) => {
  let result = await auth.getUserByID(req.params.id);
  res.json(result);
});

router.post("/checkValidUser", async (req, res) => {
  console.log("call");
  let result = await auth.checkValidUser(req.body.username, req.body.password);
  res.json(result);
});

router.post("/createUser", async (req, res) => {
  let result = await auth.createUser(req.body);
  res.json(result);
});

router.post("/editUser", async (req, res) => {
  let result = await auth.editUser(req.body);
  res.json(result);
});

router.get("/deleteUser/:name", async (req, res) => {
  let result = await auth.deleteUser(req.params.name);
  res.json(result);
});

module.exports = router;
