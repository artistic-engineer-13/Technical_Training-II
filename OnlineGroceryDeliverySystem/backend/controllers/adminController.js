import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import ErrorResponse from '../utils/ErrorHandler.js';

// @desc      Get admin dashboard analytical stats (KPIs, Charts, Recent, Low Stock)
// @route     GET /api/admin/dashboard
// @access    Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. KPI Totals
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalPartners = await User.countDocuments({ role: 'DeliveryPartner' });

    // Aggregate total completed sales revenue
    const revenueStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Completed',
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // 2. Recent Orders (Last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email phone');

    // 3. Low Stock Alerts (Stock < 10 items)
    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lt: 10 },
    }).populate('category', 'name');

    // 4. Top Selling Products (Aggregated by Order quantity)
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQtySold: { $sum: '$items.quantity' },
          revenueGenerated: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQtySold: -1 } },
      { $limit: 5 },
    ]);

    // 5. Monthly Sales (Last 6 Months aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month

    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'Completed',
          orderStatus: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Map month stats to human readable names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesChartData = monthlyStats.map((item) => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orderCount,
    }));

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
          totalPartners,
        },
        recentOrders,
        lowStockProducts,
        topProducts,
        monthlySales: monthlySalesChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc      Get exportable sales report data
// @route     GET /api/admin/reports
// @access    Private/Admin
export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      paymentStatus: 'Completed',
      orderStatus: { $ne: 'Cancelled' },
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: 1 })
      .populate('userId', 'name email');

    // Generate clean CSV content
    let csvContent = 'Order ID,Date,Customer Name,Customer Email,Subtotal,Discount,Tax,Delivery Charges,Total Amount,Payment Method\n';
    
    orders.forEach((order) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString();
      const customerName = order.userId ? order.userId.name.replace(/,/g, ' ') : 'N/A';
      const customerEmail = order.userId ? order.userId.email : 'N/A';
      
      csvContent += `${order.orderId},${dateStr},${customerName},${customerEmail},${order.subtotal},${order.discountAmount},${order.taxAmount},${order.deliveryCharges},${order.totalAmount},${order.paymentMethod}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc      Get all delivery partners (for assignments)
// @route     GET /api/admin/delivery-partners
// @access    Private/Admin
export const getDeliveryPartnersList = async (req, res, next) => {
  try {
    // Find all users with role 'DeliveryPartner' and populate their detailed records
    const partners = await User.find({ role: 'DeliveryPartner' }).select('-password');
    
    // Find detailed availability records
    const details = await DeliveryPartner.find().populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};
