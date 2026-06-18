import { dbConnect } from './db/dbConnect'
import { registerDbControllers } from './db/controller'

export const dbInit = async () => {
  registerDbControllers()
  await dbConnect()
}
