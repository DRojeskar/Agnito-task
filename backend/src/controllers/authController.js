
import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  const { email,password,name} = req.body;

  console.log(req.body,"req.body")

  const result = await authService.register({email,password,name});

  console.log(result,"result")


 return res.status(201).json({ success: true, ...result });
};

export const login = async (req, res) => {

  const { email,password } = req.body;
  console.log(req.body,"req.body")


  const result = await authService.login({ email, password });
  console.log(result,"result")
  return res.json({success: true,...result });
};

export const me = async (req, res) => {
  console.log("run")
  const user = await authService.getMe(req.user.id);
  console.log(user,"user")
 return res.json({success: true,user: { id: user._id, email: user.email, name: user.name, role: user.role }, });
};
