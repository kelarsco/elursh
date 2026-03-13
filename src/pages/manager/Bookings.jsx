import { useState, useEffect } from "react";
import { Calendar, Clock, Mail, Phone, User, CheckCircle, XCircle, Filter, Search, Download, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOnboardingSessions, deleteOnboardingSessions } from "@/lib/managerApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Handle status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      console.log('Updating booking status:', bookingId, 'to:', newStatus);
      
      // Update local state immediately for responsiveness
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      // Here you would typically make an API call to persist the status
      // For now, the local state will persist during the session
      // You can add the actual API call when your backend supports it
      
      console.log('Status updated successfully:', bookingId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on error
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'pending' }
            : booking
        )
      );
      alert('Failed to update status. Please try again.');
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async (bookingId) => {
    // Set the booking to delete and open modal
    const booking = bookings.find(b => b.id === bookingId);
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
  };

  // Confirm delete booking
  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      console.log('Attempting to delete booking:', bookingToDelete.id);
      
      // Call the delete API
      await deleteOnboardingSessions([bookingToDelete.id]);
      
      // Refresh data from backend to ensure UI is in sync
      await refreshBookings();
      
      console.log('Successfully deleted booking:', bookingToDelete.id);
      
      // Close modal
      setDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert('Failed to delete booking. Please try again.');
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  // Fetch real booking data from API
  const fetchBookings = async () => {
    try {
      const sessions = await getOnboardingSessions();
      console.log('Fetched bookings:', sessions);
      setBookings(sessions);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh bookings data
  const refreshBookings = () => {
    setLoading(true);
    fetchBookings();
  };

  // Initial data fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.name && booking.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.business_name && booking.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.store_url && booking.store_url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || (booking.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage audit session bookings</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.name || 'No Name'}</h3>
                      <p className="text-gray-600">{booking.business_name || booking.store_url || 'No Business Info'}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status || 'pending')}>
                      {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{booking.email || 'No Email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(booking.created_at || booking.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{booking.preferred_time || booking.preferred_date || 'No Time Specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{booking.store_url || 'No Store URL'}</span>
                    </div>
                  </div>
                  
                  {(booking.message || booking.notes) && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{booking.message || booking.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="w-full sm:w-auto">
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto justify-between">
                        <span>{booking.status === 'pending' ? 'Confirm' : 'Update Status'}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'pending')}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>Pending</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Confirmed</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'completed')}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span>Completed</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Cancelled</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Delete</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No bookings have been submitted yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Delete Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {bookingToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">{bookingToDelete.name || 'No Name'}</p>
                <p className="text-sm text-gray-600">{bookingToDelete.email || 'No Email'}</p>
                <p className="text-sm text-gray-600">{bookingToDelete.store_url || 'No Store URL'}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteBooking}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Bookings;
