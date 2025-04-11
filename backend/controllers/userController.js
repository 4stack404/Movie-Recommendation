import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const {userID} = req.body;
    
    const user = await userModel.findById(userID);

    if(!user) {
        return res.status(404).json({success: false, message: "User not found"});
    }

    res.json({
        success: true,
        userData: {
            name: user.name,
            isAccountVerified: user.isAccountVerified,
            favoriteMovies: user.favoriteMovies || [],
            favoriteGenres: user.favoriteGenres || [],
            preferredLanguages: user.preferredLanguages || []
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserPreferences = async (req, res) => {
  try {
    const { userID } = req.body;
    const { favoriteMovies, favoriteGenres, preferredLanguages } = req.body;

    // Validate input
    if (!favoriteMovies || !Array.isArray(favoriteMovies) || favoriteMovies.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one movie" });
    }

    if (!favoriteGenres || !Array.isArray(favoriteGenres) || favoriteGenres.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one genre" });
    }

    if (!preferredLanguages || !Array.isArray(preferredLanguages) || preferredLanguages.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one language" });
    }

    // Update user preferences
    const user = await userModel.findByIdAndUpdate(
      userID,
      {
        $set: {
          favoriteMovies,
          favoriteGenres,
          preferredLanguages,
        }
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Preferences updated successfully",
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        favoriteMovies: user.favoriteMovies,
        favoriteGenres: user.favoriteGenres,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
