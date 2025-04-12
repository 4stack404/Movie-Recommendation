import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: {type: Number, default: 0},
    authMethod: {
        type: String, 
        enum: ['local', 'google'],
        default: 'local'
    },
    favoriteGenres: [{
        type: String,
        enum: [
            'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
            'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
            'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
            'TV Movie', 'Thriller', 'War', 'Western'
        ]
    }],
    favoriteMovies: [{
        movieId: { type: String, required: true },
        movieName: { type: String, required: true },
        poster_path: { type: String },
        release_date: { type: String },
        overview: { type: String },
        vote_average: { type: Number },
        genres: [{ type: String }]
    }],
    preferredLanguages: [{ type: String }]
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
