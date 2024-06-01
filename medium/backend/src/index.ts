import { Hono } from 'hono'
import { blogRoute } from './routes/blog'
import { userRoutes } from './routes/user'
import { cors } from 'hono/cors'

const app = new Hono<{
  Bindings: {
		DATABASE_URL: string
    JWT_SECRET: string
	},
  Variables : {
		userId: string
	}
}>()

app.use('/*', cors())

app.route("/api/v1/blog",blogRoute);
app.route("/api/v1/user",userRoutes)

export default app
