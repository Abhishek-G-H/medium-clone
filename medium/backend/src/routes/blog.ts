import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRoute = new Hono<{
    Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
    Variables:{
        userId : string;
    }
}>()

blogRoute.use('/*', async (c, next) => {
    const header = c.req.header("authorization") ||"";
    const payload = header.split(" ")[1];
    try{const token = await verify(payload,c.env.JWT_SECRET);

    if(payload){
        c.set("userId",token.id as string)
        await next();
    }else{
        c.status(403);
        return c.json({error: "Unauthorized"});
    }}catch(e){
        c.status(403);
        return c.json({error: "Unauthorized"});
    }
})
  
  
blogRoute.post("/", async (c) => {
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const userId = c.get("userId");
    const body = await c.req.json();
    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId,

        }
    })
    return c.json({
        id: blog.id
    })
})
blogRoute.put("/", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json();
    const blog = await prisma.post.update({
        where: {
            id: body.id
        },
        data:{
            title: body.title,
            content: body.content,
        }
    })
    return c.json({
        id: blog.id
    })
})
blogRoute.get("/bulk", async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    
    const blogs = await prisma.post.findMany({
        select:{
            content: true,
            title: true,
            id: true,
            author:{
                select:{
                    name: true
                }
            }
        }
    })
    return c.json({blogs})
})
blogRoute.get("/:id", async (c) => {
    const {id} =c.req.param()
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {const blog = await prisma.post.findFirst({
        where: {
            id: Number(id)
        },
        select:{
            id: true,
            title: true,
            content: true,
            author:{
                select:{
                    name: true
                }
            }
        }
    })
    return c.json({blog})
    }catch(e){
        c.status(411);
        c.json({msg: "Blog not found"});
    }
})