import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Users, Shield, Building, UserCheck, LogOut, Database } from "lucide-react";

// Form schemas
const userRoleSchema = z.object({
  roleName: z.string().min(1, "Role name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

const adminUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.number().optional(),
  role: z.string().default("admin"),
});

const distributorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  contact: z.string().min(10, "Contact must be 10 digits"),
  email: z.string().email("Invalid email"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  location: z.string().min(1, "Location is required"),
  preferredMode: z.enum(["in-store", "online", "both"]),
  gstin: z.string().optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
});

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(10, "Contact must be 10 digits"),
  email: z.string().email("Invalid email"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  deviceType: z.enum(["laptop", "mobile"]),
  serialNumber: z.string().min(1, "Serial number is required"),
  brand: z.string().min(1, "Brand is required"),
  modelName: z.string().min(1, "Model name is required"),
  invoiceValue: z.number().min(1, "Invoice value is required"),
  sellerCode: z.string().optional(),
});

// Available permissions
const availablePermissions = [
  "all",
  "user_management",
  "distributor_management", 
  "customer_management",
  "claims_management",
  "reports",
  "reports_view",
  "data_view",
  "claims_review"
];

export default function AdminMasters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("roles");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check admin authentication
  const { data: adminUser, isLoading: adminLoading, error: adminError } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!adminLoading && (adminError || !adminUser)) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel",
        variant: "destructive"
      });
      setLocation("/admin/login");
    }
  }, [adminLoading, adminError, adminUser, setLocation, toast]);

  // Queries
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/admin/user-roles"],
  });

  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/admin/admins"],
  });

  const { data: distributors = [], isLoading: distributorsLoading } = useQuery({
    queryKey: ["/api/admin/distributors"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
  });

  // Forms
  const roleForm = useForm({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  const adminForm = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: 1,
      role: "admin",
    },
  });

  const distributorForm = useForm({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      businessName: "",
      contact: "",
      email: "",
      pincode: "",
      location: "",
      preferredMode: "both" as const,
      gstin: "",
      bankAccount: "",
      ifscCode: "",
      accountHolderName: "",
    },
  });

  const customerForm = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      pincode: "",
      deviceType: "mobile" as const,
      serialNumber: "",
      brand: "",
      modelName: "",
      invoiceValue: 0,
      sellerCode: "",
    },
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/user-roles", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-roles"] });
      toast({ title: "Success", description: "User role created successfully" });
      setIsDialogOpen(false);
      roleForm.reset();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/user-roles/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-roles"] });
      toast({ title: "Success", description: "User role updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/user-roles/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-roles"] });
      toast({ title: "Success", description: "User role deleted successfully" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/admins", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Success", description: "Admin user created successfully" });
      setIsDialogOpen(false);
      adminForm.reset();
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/admins/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Success", description: "Admin user updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/admins/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Success", description: "Admin user deleted successfully" });
    },
  });

  const createDistributorMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/distributors", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/distributors"] });
      toast({ title: "Success", description: "Distributor created successfully" });
      setIsDialogOpen(false);
      distributorForm.reset();
    },
  });

  const updateDistributorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/distributors/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/distributors"] });
      toast({ title: "Success", description: "Distributor updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteDistributorMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/distributors/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/distributors"] });
      toast({ title: "Success", description: "Distributor deleted successfully" });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/customers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Success", description: "Customer created successfully" });
      setIsDialogOpen(false);
      customerForm.reset();
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/customers/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Success", description: "Customer updated successfully" });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/customers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Success", description: "Customer deleted successfully" });
    },
  });

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    
    if (type === "role") {
      roleForm.reset({
        roleName: item.roleName,
        description: item.description,
        permissions: JSON.parse(item.permissions || "[]"),
      });
    } else if (type === "admin") {
      adminForm.reset({
        username: item.username,
        email: item.email,
        password: "", // Don't populate password
        roleId: item.roleId,
        role: item.role,
      });
    } else if (type === "distributor") {
      distributorForm.reset(item);
    } else if (type === "customer") {
      customerForm.reset(item);
    }
    
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number, type: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      if (type === "role") {
        deleteRoleMutation.mutate(id);
      } else if (type === "admin") {
        deleteAdminMutation.mutate(id);
      } else if (type === "distributor") {
        deleteDistributorMutation.mutate(id);
      } else if (type === "customer") {
        deleteCustomerMutation.mutate(id);
      }
    }
  };

  const onSubmitRole = (data: any) => {
    if (editingItem) {
      updateRoleMutation.mutate({ id: editingItem.id, data });
    } else {
      createRoleMutation.mutate(data);
    }
  };

  const onSubmitAdmin = (data: any) => {
    if (editingItem) {
      updateAdminMutation.mutate({ id: editingItem.id, data });
    } else {
      createAdminMutation.mutate(data);
    }
  };

  const onSubmitDistributor = (data: any) => {
    if (editingItem) {
      updateDistributorMutation.mutate({ id: editingItem.id, data });
    } else {
      createDistributorMutation.mutate(data);
    }
  };

  const onSubmitCustomer = (data: any) => {
    if (editingItem) {
      updateCustomerMutation.mutate({ id: editingItem.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    roleForm.reset();
    adminForm.reset();
    distributorForm.reset();
    customerForm.reset();
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/logout", "POST");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      setLocation("/admin/login");
    }
  });

  if (adminLoading || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BBG Admin Panel</h1>
                  <p className="text-sm text-gray-500">Welcome, {adminUser.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Shield className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/masters">
                  <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                    <Database className="h-4 w-4 mr-2" />
                    Masters
                  </Button>
                </Link>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Master Management</h1>
          <p className="text-gray-600">Manage user roles, admins, distributors, and customers</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Admin Users
            </TabsTrigger>
            <TabsTrigger value="distributors" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Distributors
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
          </TabsList>

          {/* User Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Roles Management</CardTitle>
                  <CardDescription>Define and manage user roles and permissions</CardDescription>
                </div>
                <Dialog open={isDialogOpen && selectedTab === "roles"} onOpenChange={closeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Role" : "Create New Role"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update role details" : "Create a new user role with permissions"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...roleForm}>
                      <form onSubmit={roleForm.handleSubmit(onSubmitRole)} className="space-y-4">
                        <FormField
                          control={roleForm.control}
                          name="roleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={roleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={roleForm.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permissions</FormLabel>
                              <FormControl>
                                <div className="flex flex-wrap gap-2">
                                  {availablePermissions.map((permission) => (
                                    <Button
                                      key={permission}
                                      type="button"
                                      variant={field.value.includes(permission) ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => {
                                        const current = field.value || [];
                                        if (current.includes(permission)) {
                                          field.onChange(current.filter(p => p !== permission));
                                        } else {
                                          field.onChange([...current, permission]);
                                        }
                                      }}
                                    >
                                      {permission}
                                    </Button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={closeDialog}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createRoleMutation.isPending || updateRoleMutation.isPending}>
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {rolesLoading ? (
                  <div>Loading roles...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((role: any) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.roleName}</TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(role.permissions || "[]").map((permission: string) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.isActive ? "default" : "secondary"}>
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(role, "role")}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(role.id, "role")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Admin Users Management</CardTitle>
                  <CardDescription>Manage administrative users and their access</CardDescription>
                </div>
                <Dialog open={isDialogOpen && selectedTab === "admins"} onOpenChange={closeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Admin" : "Create New Admin"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update admin user details" : "Create a new admin user"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...adminForm}>
                      <form onSubmit={adminForm.handleSubmit(onSubmitAdmin)} className="space-y-4">
                        <FormField
                          control={adminForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={adminForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={adminForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={adminForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={closeDialog}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createAdminMutation.isPending || updateAdminMutation.isPending}>
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {adminsLoading ? (
                  <div>Loading admin users...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((admin: any) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.username}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">{admin.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={admin.isActive ? "default" : "secondary"}>
                              {admin.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(admin, "admin")}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(admin.id, "admin")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distributors Tab */}
          <TabsContent value="distributors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Distributors Management</CardTitle>
                  <CardDescription>Manage distributor accounts and details</CardDescription>
                </div>
                <Dialog open={isDialogOpen && selectedTab === "distributors"} onOpenChange={closeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Distributor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Distributor" : "Create New Distributor"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update distributor details" : "Create a new distributor account"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...distributorForm}>
                      <form onSubmit={distributorForm.handleSubmit(onSubmitDistributor)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={distributorForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="contact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="preferredMode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="in-store">In-store</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={distributorForm.control}
                            name="gstin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GSTIN</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={closeDialog}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createDistributorMutation.isPending || updateDistributorMutation.isPending}>
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {distributorsLoading ? (
                  <div>Loading distributors...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Seller Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributors.map((distributor: any) => (
                        <TableRow key={distributor.id}>
                          <TableCell className="font-medium">{distributor.name}</TableCell>
                          <TableCell>{distributor.businessName || "-"}</TableCell>
                          <TableCell>{distributor.contact}</TableCell>
                          <TableCell>{distributor.email}</TableCell>
                          <TableCell>{distributor.location}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{distributor.sellerCode}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={distributor.isVerified ? "default" : "secondary"}>
                              {distributor.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(distributor, "distributor")}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(distributor.id, "distributor")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customers Management</CardTitle>
                  <CardDescription>Manage customer accounts and devices</CardDescription>
                </div>
                <Dialog open={isDialogOpen && selectedTab === "customers"} onOpenChange={closeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Edit Customer" : "Create New Customer"}</DialogTitle>
                      <DialogDescription>
                        {editingItem ? "Update customer details" : "Create a new customer account"}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...customerForm}>
                      <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={customerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="contact"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="deviceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Device Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select device type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="laptop">Laptop</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="serialNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Serial Number / IMEI</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="modelName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Model Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="invoiceValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Invoice Value</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="sellerCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Seller Code (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={closeDialog}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}>
                            {editingItem ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div>Loading customers...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Brand & Model</TableHead>
                        <TableHead>Voucher Code</TableHead>
                        <TableHead>Invoice Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer: any) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.contact}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.deviceType}</Badge>
                          </TableCell>
                          <TableCell>{customer.brand} {customer.modelName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{customer.voucherCode}</Badge>
                          </TableCell>
                          <TableCell>₹{customer.invoiceValue}</TableCell>
                          <TableCell>
                            <Badge variant={customer.isVerified ? "default" : "secondary"}>
                              {customer.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(customer, "customer")}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(customer.id, "customer")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}