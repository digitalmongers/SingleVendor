import SupportTicket from '../models/supportTicket.model.js';

class SupportTicketRepository {
    async create(ticketData) {
        return await SupportTicket.create(ticketData);
    }

    async findByCustomer(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await SupportTicket.find({ customer: customerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async findAll(query = {}, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await SupportTicket.find(query)
            .populate('customer', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async findById(id) {
        return await SupportTicket.findById(id).populate('customer', 'name email phoneNumber');
    }

    async updateById(id, updateData) {
        return await SupportTicket.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('customer', 'name email phoneNumber');
    }

    async countByStatus(status) {
        return await SupportTicket.countDocuments({ status }).lean();
    }

    async countTotal() {
        return await SupportTicket.countDocuments({}).lean();
    }
}

export default new SupportTicketRepository();