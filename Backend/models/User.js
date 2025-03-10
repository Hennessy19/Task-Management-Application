import mongoose from 'mongoose';

const Schema = mongoose.Schema;  // Changed from lowercase schema to Schema (convention)

// this defines the schema(blueprint) for the user model
const userSchema = new Schema({  // Changed to use the properly cased variable
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);