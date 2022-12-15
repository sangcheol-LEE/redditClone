import { isEmail, isEmpty, validate } from "class-validator";
import { Request, Router, Response } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookie from "cookie";

const mapError = (errors : Object[]) => {
  return errors.reduce((prev: any, err:any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1]
    return prev;
  },{})
}


const register = async(req: Request, res: Response) => {
  const {email, password, username} = req.body;
  try {
    let errors:any = {};

    // 이메일과 유저이름이 이미 저장, 사용 되고 있는 것인지 확인
    const emailUser = await User.findOneBy({email})
    const usernameUser = await User.findOneBy({username})

    // 이미 있다면, errors객체에 넣어줌.
    if(emailUser) errors.email = "이미 해당 이메일 주소가 사용중입니다."
    if(usernameUser) errors.username = "이미 이 사용자 이름이 사용중입니다."

    // 에러가 있다면, return으로 에러를 response 보내줌
    if(Object.keys(errors).length > 0) {
      return res.status(400).json(errors)
    }

    const user = new User()
    user.email = email;
    user.username = username;
    user.password = password;

    // Entity의 정해 놓은 조건으로 user 데이터의 유효성 검사 진행
    errors = await validate(user)

    if(errors.length > 0) return res.status(400).json(mapError(errors))

    // 유저정보를 유저 테이블에 저장
    await user.save();
    return res.json(user);

  }catch(error) {
    console.error(error);
    return res.status(500).json({error})
  }
}

const login = async(req: Request, res: Response) => {
  const {email, password} = req.body

  try {
    let errors: any = {}
    // 비워져있다면, 프론트엔드로 보내주기
    if(isEmpty(email)) errors.email = "이메일은 비워둘 수 없습니다."
    if(isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다."
    if(Object.keys(errors).length > 0 ){
      return res.status(400).json({errors})
    }

    // 디비에서 유저찾기
    const user = await User.findOneBy({email})

    if(!user) return res.status(404).json({email: "등록된 이메일 주소가 없습니다."})

    // 유저가 있다면 비밀번호 비교하기
    const passwordMatches = await bcrypt.compare(password, user.password)

    // 비밀번호가 다르다면 에러 보내기
    if(!passwordMatches) {
      return res.status(401).json({password : "비밀번호가 잘못되었습니다."});
    }
    // 비밀번호가 맞다면 토큰생성
    const token = jwt.sign({email}, process.env.JWT_SECRET)

    // 쿠키저장
    res.set("Ian-Cookie", cookie.serialize("token", token,
      {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }));

    return res.json({user, token})
  }catch(error) {
    console.error(error)
    return res.status(500).json(error)
  }
}
const router = Router();

router.post("/register", register)
router.post("/login", login)


export default router