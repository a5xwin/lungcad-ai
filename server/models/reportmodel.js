import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  pdf: {
    data: Buffer,
    contentType: String
  },
  filename: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
