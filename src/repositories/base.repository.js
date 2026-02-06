/**
 * Base Repository providing common database operations.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async find(filter = {}, sort = { createdAt: -1 }, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await this.model.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findById(id) {
    return await this.model.findById(id).lean();
  }

  async findOne(filter) {
    return await this.model.findOne(filter).lean();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

export default BaseRepository;
