'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  relationship = require('mongoose-relationship'),
  paginate = require('mongoose-paginate');

/**
 * Store Schema
 */
var StoreSchema = new Schema({
  created: { type: Date, default: Date.now },
  // 店名
  name: { type: String, trim: true, default: '', required: '店名は必須です。' },
  // 小売店の詳細情報
  description: { type: String, trim: true, default: '' },
  // 営業時間
  openingHours: { type: String, default: '', trim: true },
  // 電話番号
  tel: { type: String, default: '', trim: true },
  // 郵便番号
  zipCode: { type: String, default: '', trim: true },
  // 住所
  address: { type: String, default: '', trim: true },
  // アカウント
  account: { type: Schema.ObjectId, ref: 'User', childPath: 'store' },
  // 当店で販売中の商品リスト
  products: [{
    product: { type: Schema.ObjectId, ref: 'Product' }
  }],
  // 写真
  image: { type: String, trim: true }
});

StoreSchema.plugin(relationship, { relationshipPathName: 'account' });
StoreSchema.plugin(paginate);

mongoose.model('Store', StoreSchema);
