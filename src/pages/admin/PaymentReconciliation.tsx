import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  DollarSign,
  Calendar,
  ArrowRight,
} from "lucide-react";

export default function PaymentReconciliation() {
  const [unmatchedPayments, setUnmatchedPayments] = useState([
    {
      id: "1",
      refId: "SUB-1734350000-abc123",
      customerEmail: "salah@email.com",
      customerName: "John Doe",
      amount: 50000,
      tier: "premium",
      paymentDate: "2024-12-16T10:30:00",
      status: "unmatched",
    },
    {
      id: "2",
      refId: "SUB-1734351000-def456",
      customerEmail: "typo@gmial.com",
      customerName: "Jane Smith",
      amount: 100000,
      tier: "advance",
      paymentDate: "2024-12-16T11:45:00",
      status: "unmatched",
    },
  ]);

  const [allUsers, setAllUsers] = useState([
    { id: "u1", email: "user1@gmail.com", name: "User One" },
    { id: "u2", email: "user2@gmail.com", name: "User Two" },
    { id: "u3", email: "correct@email.com", name: "John Doe" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const matchPaymentToUser = async () => {
    if (!selectedPayment || !selectedUser) return;

    setProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update subscription
    console.log("Matching payment:", {
      paymentId: selectedPayment.refId,
      userId: selectedUser.id,
      tier: selectedPayment.tier,
    });

    // Remove from unmatched list
    setUnmatchedPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
    setSelectedPayment(null);
    setSelectedUser(null);
    setProcessing(false);

    alert(`✅ Payment ${selectedPayment.refId} berhasil diaktifkan untuk ${selectedUser.email}`);
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Payment Reconciliation</h1>
            <p className="text-gray-400">Match unmatched payments dengan user yang benar</p>
          </div>
          <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="text-2xl font-black text-red-400">{unmatchedPayments.length}</div>
            <div className="text-xs text-gray-400">Unmatched</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Unmatched Payments */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wide">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Payments Butuh Review
            </div>

            <div className="space-y-3">
              {unmatchedPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedPayment?.id === payment.id
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-gray-500 mb-1">{payment.refId}</div>
                      <div className="font-bold text-white text-lg mb-1">
                        Rp {payment.amount.toLocaleString("id-ID")}
                      </div>
                      <div className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                        {payment.tier}
                      </div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedPayment?.id === payment.id
                          ? "bg-emerald-500/20 border border-emerald-500/30"
                          : "bg-gray-800"
                      }`}
                    >
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span className="font-mono text-red-400">{payment.customerEmail}</span>
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{payment.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(payment.paymentDate).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              ))}

              {unmatchedPayments.length === 0 && (
                <div className="p-8 text-center bg-gray-900 rounded-xl border border-gray-800">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <div className="font-bold text-white mb-1">Semua Clear!</div>
                  <div className="text-sm text-gray-400">Tidak ada payment yang perlu direview</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: User Search & Match */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wide">
              <Search className="h-4 w-4 text-emerald-400" />
              Cari User Yang Benar
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Cari email atau nama user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedUser?.id === user.id
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedUser?.id === user.id ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-gray-800"
                      }`}
                    >
                      <User className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-sm text-gray-400 font-mono">{user.email}</div>
                    </div>
                    {selectedUser?.id === user.id && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Match Button */}
            {selectedPayment && selectedUser && (
              <div className="sticky bottom-0 pt-4 space-y-4">
                <div className="p-4 bg-gray-900 rounded-xl border border-emerald-500/30">
                  <div className="text-sm text-gray-400 mb-2">Akan melakukan matching:</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Payment</div>
                      <div className="font-mono text-sm text-white">{selectedPayment.refId}</div>
                      <div className="text-xs text-red-400">{selectedPayment.customerEmail}</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">User</div>
                      <div className="text-sm text-white font-bold">{selectedUser.name}</div>
                      <div className="text-xs text-emerald-400 font-mono">{selectedUser.email}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={matchPaymentToUser}
                  disabled={processing}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Aktifkan Subscription
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white mb-2">Cara Menggunakan</div>
              <div className="space-y-1 text-sm text-gray-400">
                <p>1. Pilih payment yang perlu direview dari daftar kiri</p>
                <p>2. Cari user yang benar berdasarkan nama atau email (cek via WhatsApp/email user)</p>
                <p>3. Klik user yang sesuai, lalu klik "Aktifkan Subscription"</p>
                <p>4. System akan otomatis mengaktifkan subscription untuk user tersebut</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
