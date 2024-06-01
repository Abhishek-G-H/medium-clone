import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {signupInput} from "@abhishekgh/medium-common"

export const userRoutes = new Hono<{
    Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
}>();

userRoutes.post("/signup", async (c) => {
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const {success} = signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Invalid Inputs"
      })
    }
  
    try {
      const user = await prisma.user.create({
        data:{
          email: body.email,
          password: body.password
        }
      })
    const token = await sign({id:user.id},c.env.JWT_SECRET);
    return c.json({
      token
    });
  }
  catch(e){
    c.status(403)
    return c.json({ error: "error while signing up" });
  }
})
  
userRoutes.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const user = await prisma.user.findFirst({
      where:{
        email: body.email,
        password: body.password
      }
    })
  
    if(user){
      const token = await sign({id:user.id},c.env.JWT_SECRET);
      return c.json({
        token
      });
    }
    c.status(403)
    return c.json({ error: "error while signing in" });
})