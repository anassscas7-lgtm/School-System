import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName } from './studentAccess';
import StudentListView from './StudentListView';
import { getStudentHeaderActions, showStudentDetails } from './studentHeaderActions';
import { buildStudentFeeRows, getStudentFeeSummary } from './studentFeeSummary';
import './StudentModule.css';

const FeeIcon = ({ type }) => {
  const paths = {
    wallet: <><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z" /><path d="M4 7V5a2 2 0 0 1 2-2h10M16 13h4" /></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></>,
    receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    dots: <><circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" /></>
  };

  return (
    <svg className="sm-fee-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentFees() {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchFees = async () => {
      setLoading(true);
      try {
        const [studentsRes, feesRes] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/fees`).then((r) => r.json()),
        ]);
        const currentStudent = studentsRes.success ? findCurrentStudent(studentsRes.data, user) : null;
        setStudent(currentStudent);
        const records = feesRes.success ? feesRes.data : [];
        setFees(records.filter((item) => Number(item.student_id) === Number(currentStudent?.student_id)));
        if (currentStudent?.student_id) {
          const voucherRes = await fetch(`${API_BASE}/fee-vouchers?studentId=${currentStudent.student_id}`).then((r) => r.json());
          setVouchers(voucherRes.success ? voucherRes.data : []);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error('Student fees fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [user]);

  const feeRows = buildStudentFeeRows(fees, vouchers);
  const { totalPaid, totalDue, accountStatus } = getStudentFeeSummary(feeRows);
  const filteredFees = feeRows.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.fee_month?.toLowerCase().includes(query) ||
      item.payment_type?.toLowerCase().includes(query) ||
      item.payment_method?.toLowerCase().includes(query)
    );
  });

  const columns = [
    { key: 'month', label: 'Month', defaultWidth: 220, visible: true },
    { key: 'paymentDate', label: 'Payment date', defaultWidth: 200, visible: true },
    { key: 'due', label: 'Due', defaultWidth: 170, visible: true },
    { key: 'received', label: 'Received', defaultWidth: 170, visible: true },
    { key: 'method', label: 'Method', defaultWidth: 160, visible: true },
    { key: 'status', label: 'Status', defaultWidth: 150, visible: true },
    { key: 'voucher', label: 'Voucher', defaultWidth: 160, visible: true }
  ];

  const downloadVoucher = (voucherId) => {
    if (!voucherId) return;
    const link = document.createElement('a');
    link.href = `${API_BASE}/fee-vouchers/${voucherId}/pdf`;
    link.download = `Fee_Voucher_${voucherId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headerActions = getStudentHeaderActions({
    pageName: 'Fee management',
    exportFileName: 'student-fees.csv',
    exportColumns: [
      { key: 'fee_month', label: 'Month' },
      { key: 'paymentDateLabel', label: 'Payment date' },
      { key: 'amount_due', label: 'Due' },
      { key: 'amount_received', label: 'Received' },
      { key: 'payment_method', label: 'Method' },
      { key: 'statusLabel', label: 'Status' },
      { key: 'voucherLabel', label: 'Voucher' }
    ],
    exportRows: filteredFees.map((item) => {
      const isPaid = Number(item.amount_received || 0) >= Number(item.amount_due || 0) && Number(item.amount_due || 0) > 0;
      return {
        ...item,
        paymentDateLabel: item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '-',
        payment_method: item.payment_method || '-',
        statusLabel: isPaid ? 'Paid' : 'Pending',
        voucherLabel: item.voucher_id ? `Voucher #${item.voucher_id}` : '-'
      };
    })
  });

  const renderCell = (item, column) => {
    const isPaid = Number(item.amount_received || 0) >= Number(item.amount_due || 0) && Number(item.amount_due || 0) > 0;
    switch (column.key) {
      case 'month':
        return item.fee_month || '-';
      case 'paymentDate':
        return item.payment_date ? new Date(item.payment_date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : '-';
      case 'due':
        return Number(item.amount_due || 0).toFixed(2);
      case 'received':
        return Number(item.amount_received || 0).toFixed(2);
      case 'method':
        return item.payment_method || '-';
      case 'status':
        return <span className={`sm-pill ${isPaid ? 'green' : 'yellow'}`}>{isPaid ? 'Paid' : 'Pending'}</span>;
      case 'voucher':
        return item.voucher_id ? (
          <button className="sm-voucher-download" type="button" onClick={() => downloadVoucher(item.voucher_id)}>
            <FeeIcon type="download" /> Download
          </button>
        ) : (
          <span className="sm-muted-inline">Not generated</span>
        );
      default:
        return '-';
    }
  };

  return (
    <DashboardLayout userRole="student" currentPath="/student/fees" userName={studentName} userInitials={initials}>
      <div className="student-fees-page">
        <div className="sm-page-header">
          <div>
            <h2>Fee management</h2>
            <p>Fee payment history and current account status</p>
          </div>
          <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
        </div>

        <Header {...headerActions} />

        <div className="sm-fee-stats">
          <div className="sm-fee-stat">
            <span className="sm-fee-stat-icon blue"><FeeIcon type="wallet" /></span>
            <div><span>Monthly fee</span><strong>{Number(student?.monthly_fee || 0).toFixed(2)}</strong><small>PKR configured</small></div>
          </div>
          <div className="sm-fee-stat">
            <span className="sm-fee-stat-icon green"><FeeIcon type="cash" /></span>
            <div><span>Total paid</span><strong>{totalPaid}</strong><small>PKR received</small></div>
          </div>
          <div className="sm-fee-stat">
            <span className="sm-fee-stat-icon orange"><FeeIcon type="receipt" /></span>
            <div><span>Total due</span><strong>{totalDue.toFixed(2)}</strong><small>PKR unpaid</small></div>
          </div>
          <div className="sm-fee-stat">
            <span className="sm-fee-stat-icon purple"><FeeIcon type="clock" /></span>
            <div><span>Status</span><strong>{accountStatus}</strong><small>Current account state</small></div>
          </div>
        </div>

        <StudentListView
          storageKey="student-fees-columns-v2"
          columnDefinitions={columns}
          rows={filteredFees}
          getRowId={(item) => item.row_id}
          renderCell={renderCell}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search fee records..."
          emptyMessage="No fee payments or vouchers found."
          itemLabel="payments"
          actionsHeader=""
          actionsWidth={72}
          renderActions={(item) => (
            <button
              className="sm-fee-action"
              type="button"
              aria-label="Payment options"
              onClick={() => showStudentDetails(item.fee_month || 'Fee record', [
                { label: 'Payment date', value: item.payment_date ? new Date(item.payment_date).toLocaleDateString() : '-' },
                { label: 'Due', value: `PKR ${Number(item.amount_due || 0).toFixed(2)}` },
                { label: 'Received', value: `PKR ${Number(item.amount_received || 0).toFixed(2)}` },
                { label: 'Method', value: item.payment_method || '-' }
              ])}
            >
              <FeeIcon type="dots" />
            </button>
          )}
        />
      </div>
    </DashboardLayout>
  );
}
