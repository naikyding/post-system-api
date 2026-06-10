const mongoose = require('mongoose')

const productCategorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['draft', 'available', 'hidden'],
      default: 'draft',
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'agent 是必填項目'],
      index: true,
    },

    sort: {
      type: Number,
      default: 0,
    },

    includeInDashboard: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

productCategorySchema.index(
  {
    agent: 1,
    slug: 1,
  },
  {
    unique: true,
  }
)

productCategorySchema.index(
  {
    agent: 1,
    name: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('ProductCategory', productCategorySchema)
