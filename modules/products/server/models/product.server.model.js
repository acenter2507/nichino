'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  paginate = require('mongoose-paginate');

/**
 * Product Schema
 */
var ProductSchema = new Schema({
  // 商品名
  name: { type: String, trim: true, default: '' },
  // 登録番号
  productNumber: { type: String, default: '' },
  // 有効成分
  ingredient: { type: String, default: '' },
  // 性状
  property: { type: String, default: '' },
  // 毒性
  toxicity: { type: String, default: '' },
  // 危険物
  explosive: { type: String, default: 'ー' },
  // 有効年限
  expiration: { type: String, default: '' },
  // 包装
  packaging: { type: String, default: '' },
  // 特長
  features: { type: String, default: '', trim: true },
  // 注意事項
  notes: { type: String, default: '', trim: true },
  // 安全使用上の注意事項
  precautions: { type: String, default: '', trim: true },
  // 値段
  price: { type: String, trim: true, default: '' },
  // 写真
  image: { type: String }
});
ProductSchema.plugin(paginate);

mongoose.model('Product', ProductSchema);
