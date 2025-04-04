import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  pdfFile: {
    data: {
      type: Buffer,
      required: true
    },
    contentType: {
      type: String,
      required: true
    }
  },
  filename: {
    type: String,
    default: "report.pdf"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Report", ReportSchema);
