const User = require('../models/User');

// Get all doctors (public info only)
exports.getAllDoctorsPublic = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' })
            .select('firstName lastName email phone _id') // Exclude password
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des médecins'
        });
    }
};
