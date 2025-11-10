/**
 * User Management Page (Admin Only)
 * Manage users, roles, and permissions
 */

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Search, Plus, Edit, Trash2, RefreshCw, Key, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { getRoleColor } from "@/config/permissions";

export default function UserManagement() {
  const { user: currentUser } = useAuthStore();
  const {
    users,
    fetchUsers,
    deleteUser,
    restoreUser,
    resetUserPIN,
    isLoading,
    currentPage,
    totalPages,
    setPage,
    filters,
    setFilters,
  } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPINDialog, setShowResetPINDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPIN, setNewPIN] = useState("");

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters
  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchQuery || undefined,
      role: selectedRole ? (selectedRole as any) : undefined,
      isActive: selectedStatus === "active" ? true : selectedStatus === "inactive" ? false : undefined,
    });
    fetchUsers(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
    setFilters({});
    fetchUsers(1);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await deleteUser(selectedUserId);
      setShowDeleteDialog(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Reset PIN
  const handleResetPIN = async () => {
    if (!selectedUserId || !currentUser?.id || !newPIN) return;

    try {
      await resetUserPIN(selectedUserId, newPIN, currentUser.id);
      setShowResetPINDialog(false);
      setSelectedUserId(null);
      setNewPIN("");
    } catch (error) {
      console.error("Error resetting PIN:", error);
    }
  };

  // Pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
      fetchUsers(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
      fetchUsers(currentPage + 1);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const color = getRoleColor(role as any);
    const colorMap: Record<string, string> = {
      red: "bg-red-500 text-white",
      blue: "bg-blue-500 text-white",
      green: "bg-green-500 text-white",
      gray: "bg-gray-500 text-white",
    };
    return colorMap[color] || "bg-gray-500 text-white";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola user, role, dan akses sistem</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total User</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              </div>
              <Badge className="bg-red-500 text-white">Admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Panitia</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "panitia").length}</p>
              </div>
              <Badge className="bg-blue-500 text-white">Panitia</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jamaah</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "member").length}</p>
              </div>
              <Badge className="bg-gray-500 text-white">Jamaah</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Input
                placeholder="Cari username atau nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="panitia">Panitia</option>
                <option value="ustadz">Ustadz</option>
                <option value="member">Jamaah</option>
              </select>
            </div>
            <div>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
              <Button onClick={handleResetFilters} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar User</CardTitle>
              <CardDescription>Kelola semua user dalam sistem</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Tidak ada user ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.subscriptionTier.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon-sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowResetPINDialog(true);
                          }}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowDeleteDialog(true);
                          }}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user ini? User akan dinonaktifkan dan tidak dapat login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={showResetPINDialog} onOpenChange={setShowResetPINDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset PIN User</DialogTitle>
            <DialogDescription>
              Masukkan PIN baru untuk user. User akan dipaksa mengganti PIN saat login berikutnya.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">PIN Baru (6 digit)</label>
              <Input
                type="password"
                placeholder="Masukkan PIN baru"
                maxLength={6}
                value={newPIN}
                onChange={(e) => setNewPIN(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResetPINDialog(false);
                setNewPIN("");
              }}
            >
              Batal
            </Button>
            <Button onClick={handleResetPIN} disabled={newPIN.length !== 6}>
              Reset PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
