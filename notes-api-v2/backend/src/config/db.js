import mongoose from 'mongoose'

const connectDB = async() => {
    const uri = process.env.MONGO_URL

    try {
        await mongoose.connect(uri)
    } catch (error) {
        console.log(`MongoDB Connection Error: ${error}`)
        process.exit(1)
    }
}

export default connectDB