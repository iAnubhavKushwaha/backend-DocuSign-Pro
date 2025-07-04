import mongoose from 'mongoose';

const signatureSchema = mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['signature', 'text', 'date'],
    required: true
  }
}, { _id: true });

const documentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    signed: {
      type: Boolean,
      default: false,
    },
    signedAt: {
      type: Date,
    },
    signatures: [signatureSchema]
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;