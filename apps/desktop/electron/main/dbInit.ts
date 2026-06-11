import { dbConnect } from './db/dbConnect'

export const dbInit = async () => {
  await dbConnect()
}
