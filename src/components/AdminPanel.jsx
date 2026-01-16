import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AdminPanel = () => {
  const { t } = useLanguage();
  const { createClient, getClients, deleteClient } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comments, setComments] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/requests');
      setRequests(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Unable to connect to the server. Please make sure the backend server is running on port 5000.');
      } else {
        setError(t('admin.errorLoading', 'Error loading requests'));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      await api.put(`/admin/requests/${selectedRequest.id}/status`, {
        status: newStatus,
        comments: comments
      });

      // Update local state
      setRequests(requests.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: newStatus, adminComments: comments }
          : req
      ));

      setStatusDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus('');
      setComments('');
    } catch (err) {
      setError(t('admin.errorUpdating', 'Error updating request status'));
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const openStatusDialog = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setComments(request.adminComments || '');
    setStatusDialogOpen(true);
  };

  const loadUsers = useCallback(async () => {
    try {
      const userList = await getClients();
      setUsers(userList);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(t('admin.errorLoadingUsers', 'Error loading users'));
    }
  }, [getClients, t]);

  useEffect(() => {
    const fetchUsers = async () => {
      await loadUsers();
    };
    fetchUsers();
  }, [loadUsers]);

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setError(t('admin.userValidation', 'Username and password are required'));
      return;
    }

    try {
      await createClient(newUsername.trim(), newPassword.trim());
      await loadUsers();
      setUserDialogOpen(false);
      setNewUsername('');
      setNewPassword('');
      setError('');
    } catch (err) {
      setError(t('admin.userCreateError', 'Error creating user'));
      console.error('Error creating user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('admin.confirmDelete', 'Are you sure you want to delete this user?'))) {
      try {
        await deleteClient(userId);
        await loadUsers();
      } catch (err) {
        setError(t('admin.userDeleteError', 'Error deleting user'));
        console.error('Error deleting user:', err);
      }
    }
  };

  const generateReport = (type) => {
    let filteredRequests = [];
    let reportTitle = '';

    switch (type) {
      case 'all':
        filteredRequests = requests;
        reportTitle = t('admin.allRequestsReport', 'All Requests Report');
        break;
      case 'pending':
        filteredRequests = requests.filter(r => r.status === 'pending');
        reportTitle = t('admin.pendingRequestsReport', 'Pending Requests Report');
        break;
      case 'completed':
        filteredRequests = requests.filter(r => r.status === 'completed');
        reportTitle = t('admin.completedRequestsReport', 'Completed Requests Report');
        break;
      default:
        filteredRequests = requests;
        reportTitle = t('admin.allRequestsReport', 'All Requests Report');
    }

    // Generate CSV content
    const csvContent = [
      ['Organization', 'Contact Person', 'Phone', 'Email', 'Event Date', 'Event Time', 'Location', 'Event Type', 'Media Type', 'Status', 'Submitted At'],
      ...filteredRequests.map(request => [
        request.organization,
        request.contactPerson,
        request.phone,
        request.email,
        new Date(request.eventDate).toLocaleDateString(),
        request.eventTime,
        request.location,
        request.eventType,
        request.mediaType,
        request.status,
        new Date(request.createdAt || request.eventDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          {t('admin.loading', 'Loading...')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('admin.title', 'Admin Panel')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label={t('admin.requestsTab', 'Requests')} />
            <Tab label={t('admin.reportsTab', 'Reports')} />
            <Tab label={t('admin.usersTab', 'User Management')} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.table.organization', 'Organization')}</TableCell>
                    <TableCell>{t('admin.table.contact', 'Contact Person')}</TableCell>
                    <TableCell>{t('admin.table.eventDescription', 'Event Description')}</TableCell>
                    <TableCell>{t('admin.table.eventDate', 'Event Date')}</TableCell>
                    <TableCell>{t('admin.table.status', 'Status')}</TableCell>
                    <TableCell>{t('admin.table.actions', 'Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.organization}</TableCell>
                      <TableCell>{request.contactPerson}</TableCell>
                      <TableCell>{request.description}</TableCell>
                      <TableCell>
                        {new Date(request.eventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`status.${request.status}`, request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openStatusDialog(request)}
                        >
                          {t('admin.updateStatus', 'Update Status')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {requests.length === 0 && !loading && (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                {t('admin.noRequests', 'No requests found')}
              </Typography>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              {t('admin.reportsTitle', 'Request Reports')}
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => generateReport('all')}
              >
                {t('admin.generateAllReport', 'Generate All Requests Report')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => generateReport('pending')}
              >
                {t('admin.generatePendingReport', 'Generate Pending Requests Report')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => generateReport('completed')}
              >
                {t('admin.generateCompletedReport', 'Generate Completed Requests Report')}
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('admin.reportSummary', 'Report Summary')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Paper sx={{ p: 2, minWidth: 150 }}>
                  <Typography variant="h4" color="primary">
                    {requests.length}
                  </Typography>
                  <Typography variant="body2">
                    {t('admin.totalRequests', 'Total Requests')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, minWidth: 150 }}>
                  <Typography variant="h4" color="warning.main">
                    {requests.filter(r => r.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2">
                    {t('admin.pendingRequests', 'Pending Requests')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, minWidth: 150 }}>
                  <Typography variant="h4" color="success.main">
                    {requests.filter(r => r.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2">
                    {t('admin.approvedRequests', 'Approved Requests')}
                  </Typography>
                </Paper>
                <Paper sx={{ p: 2, minWidth: 150 }}>
                  <Typography variant="h4" color="info.main">
                    {requests.filter(r => r.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2">
                    {t('admin.completedRequests', 'Completed Requests')}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              {t('admin.recentRequests', 'Recent Requests')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.table.organization', 'Organization')}</TableCell>
                    <TableCell>{t('admin.table.contact', 'Contact Person')}</TableCell>
                    <TableCell>{t('admin.table.eventDate', 'Event Date')}</TableCell>
                    <TableCell>{t('admin.table.status', 'Status')}</TableCell>
                    <TableCell>{t('admin.table.submittedAt', 'Submitted At')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.slice(0, 10).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.organization}</TableCell>
                      <TableCell>{request.contactPerson}</TableCell>
                      <TableCell>
                        {new Date(request.eventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`status.${request.status}`, request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt || request.eventDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setUserDialogOpen(true)}
              >
                {t('admin.createUser', 'Create User')}
              </Button>
            </Box>

            {isMobile ? (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} key={user.id}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('admin.userTable.role', 'Role')}: {user.role}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('admin.userTable.createdAt', 'Created At')}: {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {t('admin.deleteUser', 'Delete')}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('admin.userTable.username', 'Username')}</TableCell>
                      <TableCell>{t('admin.userTable.role', 'Role')}</TableCell>
                      <TableCell>{t('admin.userTable.createdAt', 'Created At')}</TableCell>
                      <TableCell>{t('admin.userTable.actions', 'Actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {t('admin.deleteUser', 'Delete')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {users.length === 0 && (
              <Typography variant="body1" align="center" sx={{ mt: 3 }}>
                {t('admin.noUsers', 'No users found')}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>
          {t('admin.updateStatusTitle', 'Update Request Status')}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('admin.status', 'Status')}</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label={t('admin.status', 'Status')}
            >
              <MenuItem value="pending">{t('status.pending', 'Pending')}</MenuItem>
              <MenuItem value="approved">{t('status.approved', 'Approved')}</MenuItem>
              <MenuItem value="rejected">{t('status.rejected', 'Rejected')}</MenuItem>
              <MenuItem value="completed">{t('status.completed', 'Completed')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('admin.comments', 'Comments')}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            {t('admin.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleStatusChange} variant="contained">
            {t('admin.update', 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogTitle>
          {t('admin.createUserTitle', 'Create New User')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('admin.username', 'Username')}
            fullWidth
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label={t('admin.password', 'Password')}
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            {t('admin.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleCreateUser} variant="contained">
            {t('admin.create', 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
