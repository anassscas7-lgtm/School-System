import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import AdminListView from '../../components/AdminListView';
import './FeeManagement.css';

const IconSearch = ({ className }) => <svg className={className} width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>;
const SvgSearch = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14Z"/></svg>;
const SvgFeeDoc = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/><path d="M10 12h5M10 16h4"/></svg>;
const SvgVoucher = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>;
const SvgDate = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>;
const SvgMore = () => <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Z"/></svg>;
const FeeLineIcon = ({ type }) => {
  const paths = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    wallet: <path d="M20 7H5a2 2 0 0 0 0 4h15v8H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h15v4ZM16 14h.01" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    voucher: <><path d="M6 3h12a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 0 1 2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>
  };

  return (
    <svg className="fm-line-icon" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function FeeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [feeRecords, setFeeRecords] = useState([]);
  const [feeVouchers, setFeeVouchers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const recordsPerPage = 7;

  // 痩 NEW: Checkbox Selection State
  const [selectedRows, setSelectedRows] = useState([]);

  // Search/Lookup State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form Initial State
  const initialFormState = {
    paymentType: 'Monthly fee',
    feeMonth: 'May 2026',
    paymentDate: new Date().toISOString().split('T')[0],
    amountDue: 4500,
    discountAmount: 0,
    amountReceived: 4500,
    paymentMethod: 'Cash',
    transactionId: '',
    remarks: '',
    printReceipt: true,
    emailGuardian: true,
    smsConfirm: false
  };
  const [formData, setFormData] = useState(initialFormState);
  const buildMonthOptions = () => {
    const base = new Date();
    return [-1, 0, 1].map((offset) => {
      const date = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });
  };
  const voucherMonthOptions = buildMonthOptions();
  const defaultVoucherDate = new Date().toISOString().split('T')[0];
  const defaultLastDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [voucherForm, setVoucherForm] = useState({
    classKey: '',
    feeMonth: voucherMonthOptions[1] || 'Current Month',
    amount: 4500,
    issueDate: defaultVoucherDate,
    lastDate: defaultLastDate
  });
  const [selectedVoucherStudents, setSelectedVoucherStudents] = useState([]);
  const [expandedFeeGroupKey, setExpandedFeeGroupKey] = useState(null);

  const fetchData = async () => {
    try {
      const [feeRes, stuRes, classRes] = await Promise.all([
        fetch('/api/fees').then(r => r.json()),
        fetch('/api/students').then(r => r.json()),
        fetch('/api/classes').then(r => r.json())
      ]);
      const voucherRes = await fetch('/api/fee-vouchers').then(r => r.json());
      if (feeRes.success) setFeeRecords(feeRes.data);
      if (voucherRes.success) setFeeVouchers(voucherRes.data);
      if (stuRes.success) setAllStudents(stuRes.data);
      if (classRes.success) setAllClasses(classRes.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setSelectedRows([]);
    setCurrentPage(1);
    await fetchData();
    Swal.fire({
      icon: 'success',
      title: 'Fee records refreshed',
      showConfirmButton: false,
      timer: 900
    });
  };

  // 👉 NEW: Bulk Delete Logic for Fee Records
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Selection',
        text: 'Please select a fee month row first.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    const selectedGroups = feeGroupRecords.filter((record) => selectedRows.includes(record.id));
    handleDeleteFeeGroups(selectedGroups);
  };

  // 👉 NEW: Export Logic Added
  const handleExport = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select fee records from the table to export.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const selectedData = feeGroupRecords.filter(record => selectedRows.includes(record.id));
    const headers = ["Month", "Grade", "Section", "Amount", "Due Date", "Method", "Paid", "Unpaid", "Status"];

    const csvRows = selectedData.map(r => [
      `"${r.month}"`,
      `"${r.grade}"`,
      `"${r.section}"`,
      `"PKR ${r.amount}"`,
      `"${r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}"`,
      `"${r.method}"`,
      r.paidCount,
      r.unpaidCount,
      r.status
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fee_Records_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStudentSearch = (val) => {
    setStudentSearch(val);
    const found = allStudents.find(s =>
      s.roll_no.toLowerCase() === val.toLowerCase() ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(val.toLowerCase())
    );
    setSelectedStudent(found || null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedPaymentId(null);
    setFormData(initialFormState);
    setStudentSearch('');
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const formatDateToInput = (value) => {
    if (!value) return new Date().toISOString().split('T')[0];
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
  };

  const openEditModal = (record) => {
    const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
    const student = allStudents.find((item) => item.student_id === record.student_id) || {
      student_id: record.student_id,
      first_name: record.first_name || '',
      last_name: record.last_name || '',
      roll_no: record.roll_no || '',
      grade: record.grade || ''
    };
    setModalMode('edit');
    setSelectedPaymentId(record.payment_id);
    setSelectedStudent(student);
    setStudentSearch(fullName || record.roll_no || '');
    setFormData({
      paymentType: record.payment_type || 'Monthly fee',
      feeMonth: record.fee_month || 'May 2026',
      paymentDate: formatDateToInput(record.payment_date),
      amountDue: record.amount_due || record.amount_received || 4500,
      discountAmount: record.discount_amount || 0,
      amountReceived: record.amount_received || 4500,
      paymentMethod: record.payment_method || 'Cash',
      transactionId: record.transaction_id || '',
      remarks: record.remarks || '',
      printReceipt: record.print_receipt !== false,
      emailGuardian: record.email_guardian !== false,
      smsConfirm: record.sms_confirm === true
    });
    setIsModalOpen(true);
  };

  const getClassKey = (item) => `${item?.grade || ''}-${item?.section || ''}`;

  const classOptions = allClasses.length > 0
    ? allClasses.map((item) => ({
        key: getClassKey(item),
        label: `${item.grade || '-'} - Section ${item.section || '-'}`,
        grade: item.grade || '-',
        section: item.section || '-'
      }))
    : [...new Set(allStudents.map(getClassKey).filter((item) => item && item !== '-'))].map((key) => {
        const [grade, section] = key.split('-');
        return { key, label: `${grade || '-'} - Section ${section || '-'}`, grade, section };
      });

  const voucherStudents = allStudents.filter((student) => voucherForm.classKey && getClassKey(student) === voucherForm.classKey);
  const selectedVoucherStudentRecords = voucherStudents.filter((student) => selectedVoucherStudents.includes(student.student_id));

  const openVoucherModal = () => {
    const firstClass = classOptions[0]?.key || '';
    setVoucherForm((current) => ({ ...current, classKey: firstClass }));
    const studentsForClass = allStudents.filter((student) => firstClass && getClassKey(student) === firstClass);
    setSelectedVoucherStudents(studentsForClass.map((student) => student.student_id));
    setIsVoucherOpen(true);
  };

  const handleVoucherClassChange = (classKey) => {
    setVoucherForm((current) => ({ ...current, classKey }));
    const studentsForClass = allStudents.filter((student) => classKey && getClassKey(student) === classKey);
    setSelectedVoucherStudents(studentsForClass.map((student) => student.student_id));
  };

  const handleVoucherInput = (event) => {
    const { name, value } = event.target;
    setVoucherForm((current) => ({ ...current, [name]: value }));
  };

  const toggleVoucherStudent = (studentId) => {
    setSelectedVoucherStudents((current) => current.includes(studentId)
      ? current.filter((id) => id !== studentId)
      : [...current, studentId]);
  };

  const setAllVoucherStudents = (checked) => {
    setSelectedVoucherStudents(checked ? voucherStudents.map((student) => student.student_id) : []);
  };

  const getSelectedClassInfo = () => classOptions.find((item) => item.key === voucherForm.classKey) || { grade: '-', section: '-', label: 'Selected class' };

  const drawVoucher = (doc, student, indexOnPage) => {
    const classInfo = getSelectedClassInfo();
    const y = indexOnPage === 0 ? 14 : 153;
    const voucherHeight = 125;
    const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
    const amount = Number(voucherForm.amount || 0);

    doc.setDrawColor(29, 78, 216);
    doc.setLineWidth(0.7);
    doc.roundedRect(12, y, 186, voucherHeight, 3, 3);

    doc.setFillColor(239, 246, 255);
    doc.rect(12, y, 186, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(7, 19, 55);
    doc.text('EduSync Fee Voucher', 18, y + 14);
    doc.setFontSize(9);
    doc.setTextColor(83, 102, 143);
    doc.text(`Fee Month: ${voucherForm.feeMonth}`, 144, y + 10, { align: 'right' });
    doc.text(`Voucher No: FV-${student.student_id}-${Date.now().toString().slice(-5)}`, 144, y + 16, { align: 'right' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const leftX = 18;
    const rightX = 112;
    const rowGap = 11;
    const startY = y + 38;
    const rows = [
      ['Student Name', studentName, 'Student ID', student.student_id || '-'],
      ['Guardian Name', student.guardian_name || student.guardian || '-', 'Amount', `PKR ${amount.toLocaleString('en-US')}`],
      ['Grade', student.grade || classInfo.grade || '-', 'Section', student.section || classInfo.section || '-'],
      ['Issue Date', voucherForm.issueDate, 'Last Date', voucherForm.lastDate],
    ];

    rows.forEach((row, rowIndex) => {
      const rowY = startY + (rowIndex * rowGap);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(83, 102, 143);
      doc.text(`${row[0]}:`, leftX, rowY);
      doc.text(`${row[2]}:`, rightX, rowY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(String(row[1]), leftX + 31, rowY);
      doc.text(String(row[3]), rightX + 29, rowY);
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(18, y + 86, 192, y + 86);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(7, 19, 55);
    doc.text('Payment Instructions', 18, y + 98);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(83, 102, 143);
    doc.text('Please submit this fee before the last date. Keep this voucher for your record.', 18, y + 108);
    doc.text('Authorized Signature: ____________________', 112, y + 121);
  };

  const generateFeeVoucherPdf = async () => {
    if (!voucherForm.classKey) {
      Swal.fire({ icon: 'info', title: 'Select class', text: 'Please select a class before generating vouchers.', confirmButtonColor: '#1d4ed8' });
      return;
    }
    if (!voucherForm.amount || Number(voucherForm.amount) <= 0) {
      Swal.fire({ icon: 'info', title: 'Enter amount', text: 'Please enter a valid fee amount.', confirmButtonColor: '#1d4ed8' });
      return;
    }
    if (!selectedVoucherStudentRecords.length) {
      Swal.fire({ icon: 'info', title: 'Select students', text: 'Please select at least one student for voucher generation.', confirmButtonColor: '#1d4ed8' });
      return;
    }

    const classInfo = getSelectedClassInfo();
    try {
      const response = await fetch('/api/fee-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedVoucherStudentRecords.map((student) => student.student_id),
          feeMonth: voucherForm.feeMonth,
          amount: voucherForm.amount,
          issueDate: voucherForm.issueDate,
          lastDate: voucherForm.lastDate,
          grade: classInfo.grade,
          section: classInfo.section
        })
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Could not save vouchers.');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Could not save vouchers', text: error.message, confirmButtonColor: '#1d4ed8' });
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    selectedVoucherStudentRecords.forEach((student, index) => {
      if (index > 0 && index % 2 === 0) doc.addPage();
      drawVoucher(doc, student, index % 2);
    });
    const safeClass = String(classInfo.label || 'class').replace(/[^a-z0-9]+/gi, '_');
    const safeMonth = String(voucherForm.feeMonth || 'month').replace(/[^a-z0-9]+/gi, '_');
    doc.save(`Fee_Vouchers_${safeClass}_${safeMonth}.pdf`);
    setIsVoucherOpen(false);
    fetchData();
    Swal.fire({ icon: 'success', title: 'Fee vouchers generated', text: 'Students can now download their voucher from the student fee page.', confirmButtonColor: '#1d4ed8' });
  };

  const focusFeeForm = () => {
    setTimeout(() => {
      const modalBody = document.querySelector('.fm-modal-body');
      const searchField = document.querySelector('.fm-modal [name="studentSearch"]');
      modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
      searchField?.focus?.({ preventScroll: true });
    }, 120);
  };

  const showFeeFormNotice = () => {
    Swal.fire({
      icon: 'warning',
      title: 'Student required',
      text: 'Please find and select a student before saving this payment.',
      confirmButtonText: 'Review form',
      buttonsStyling: false,
      customClass: {
        container: 'fm-swal-container',
        popup: 'fm-swal-popup',
        title: 'fm-swal-title',
        htmlContainer: 'fm-swal-text',
        confirmButton: 'fm-swal-confirm'
      }
    }).then(focusFeeForm);
  };

  const handleRecordPayment = async (e) => {
    if (e) e.preventDefault();
    if (!selectedStudent) {
      showFeeFormNotice();
      return;
    }
    setLoading(true);
    const payload = { ...formData, studentId: selectedStudent.student_id };
    try {
      const url = modalMode === 'edit'
        ? `/api/fees/${selectedPaymentId}`
        : '/api/fees';
      const response = await fetch(url, {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await response.json();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: modalMode === 'edit' ? 'Payment Updated!' : 'Payment Recorded!',
          text: `Fee for ${selectedStudent.first_name} has been updated.`,
          confirmButtonColor: '#16a34a'
        });
        setIsModalOpen(false);
        fetchData();
        setStudentSearch('');
        setSelectedStudent(null);
        setSelectedPaymentId(null);
        setModalMode('add');
        setSelectedRows([]);
        setFormData(initialFormState);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      console.error("Submission Error:", err);
      Swal.fire('Error', 'Could not save payment: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForStudentMonth = (studentId, feeMonth) => feeRecords.find((record) =>
    Number(record.student_id) === Number(studentId) &&
    String(record.fee_month || '').toLowerCase() === String(feeMonth || '').toLowerCase()
  );

  const feeGroupMap = new Map();
  feeVouchers.forEach((voucher) => {
    const key = `${voucher.fee_month || 'Current Month'}|${voucher.grade || '-'}|${voucher.section || '-'}`;
    if (!feeGroupMap.has(key)) {
      feeGroupMap.set(key, {
        id: key,
        month: voucher.fee_month || 'Current Month',
        grade: voucher.grade || '-',
        section: voucher.section || '-',
        amount: Number(voucher.amount_due || 0),
        dueDate: voucher.due_date,
        method: 'Cash',
        vouchers: []
      });
    }
    feeGroupMap.get(key).vouchers.push(voucher);
  });

  feeRecords.forEach((payment) => {
    const key = `${payment.fee_month || 'Current Month'}|${payment.grade || '-'}|${payment.section || '-'}`;
    if (!feeGroupMap.has(key)) {
      feeGroupMap.set(key, {
        id: key,
        month: payment.fee_month || 'Current Month',
        grade: payment.grade || '-',
        section: payment.section || '-',
        amount: Number(payment.amount_due || payment.amount_received || 0),
        dueDate: payment.payment_date,
        method: payment.payment_method || 'Cash',
        vouchers: []
      });
    }
  });

  const feeGroupRecords = Array.from(feeGroupMap.values()).map((group) => {
    const students = allStudents.filter((student) => student.grade === group.grade && student.section === group.section);
    const amount = group.amount || Number(students[0]?.monthly_fee || 0);
    const paidStudents = students.filter((student) => {
      const payment = getPaymentForStudentMonth(student.student_id, group.month);
      return payment && Number(payment.amount_received || 0) >= Number(payment.amount_due || amount || 0);
    });
    const paidCount = paidStudents.length;
    const totalCount = students.length;
    return {
      ...group,
      amount,
      students,
      paidCount,
      unpaidCount: Math.max(totalCount - paidCount, 0),
      totalCount,
      status: totalCount > 0 && paidCount === totalCount ? 'Unactive' : 'Active'
    };
  });

  const filteredRecords = feeGroupRecords.filter(record => {
    const search = searchTerm.toLowerCase();
    return (
      record.month.toLowerCase().includes(search) ||
      record.grade.toLowerCase().includes(search) ||
      record.section.toLowerCase().includes(search) ||
      record.status.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const formatAmount = (value) => {
    const numeric = Number(value || 0);
    return `PKR ${numeric.toLocaleString('en-US')}`;
  };

  const handleStudentFeeStatus = async (group, student, markPaid) => {
    const existingPayment = getPaymentForStudentMonth(student.student_id, group.month);
    const payload = {
      studentId: student.student_id,
      paymentType: 'Monthly fee',
      feeMonth: group.month,
      paymentDate: new Date().toISOString().split('T')[0],
      amountDue: group.amount,
      discountAmount: 0,
      amountReceived: markPaid ? group.amount : 0,
      paymentMethod: group.method || 'Cash',
      transactionId: '',
      remarks: markPaid ? 'Marked paid by admin' : 'Marked unpaid by admin',
      printReceipt: true,
      emailGuardian: true,
      smsConfirm: false
    };

    try {
      if (markPaid) {
        const response = await fetch(existingPayment ? `/api/fees/${existingPayment.payment_id}` : '/api/fees', {
          method: existingPayment ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Could not mark fee as paid.');
      } else if (existingPayment?.payment_id) {
        const response = await fetch('/api/fees/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [existingPayment.payment_id] })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Could not mark fee as unpaid.');
      }
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: markPaid ? 'Marked paid' : 'Marked unpaid',
        text: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student fee status updated.',
        showConfirmButton: false,
        timer: 900
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Fee status failed', text: error.message, confirmButtonColor: '#1d4ed8' });
    }
  };

  const readApiResponse = async (response, fallbackMessage) => {
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`${fallbackMessage} Please restart the backend server and try again.`);
      }
    }
    if (!response.ok || data.success === false) {
      throw new Error(data.message || fallbackMessage);
    }
    return data;
  };

  const handleDeleteFeeGroups = async (records) => {
    if (!records.length) return;
    const relatedPaymentIds = records.flatMap((record) =>
      feeRecords
        .filter((payment) =>
          String(payment.fee_month || '').toLowerCase() === String(record.month || '').toLowerCase() &&
          String(payment.grade || '') === String(record.grade || '') &&
          String(payment.section || '') === String(record.section || '')
        )
        .map((payment) => payment.payment_id)
        .filter(Boolean)
    );
    const relatedVoucherIds = records.flatMap((record) => (record.vouchers || []).map((voucher) => voucher.voucher_id).filter(Boolean));
    const uniquePaymentIds = [...new Set(relatedPaymentIds)];
    const uniqueVoucherIds = [...new Set(relatedVoucherIds)];

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete fee record?',
      text: records.length === 1
        ? `This will delete fee data for ${records[0].month} - ${records[0].grade} Section ${records[0].section}.`
        : `This will delete fee data for ${records.length} selected fee records.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (!result.isConfirmed) return;

    if (uniquePaymentIds.length === 0 && uniqueVoucherIds.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No fee data',
        text: 'There are no fee payment or voucher records available to delete.',
        confirmButtonColor: '#1d4ed8'
      });
      return;
    }

    try {
      if (uniquePaymentIds.length > 0) {
        const response = await fetch('/api/fees/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: uniquePaymentIds })
        });
        await readApiResponse(response, 'Could not delete fee payment records.');
      }

      if (uniqueVoucherIds.length > 0) {
        const response = await fetch('/api/fee-vouchers/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: uniqueVoucherIds })
        });
        await readApiResponse(response, 'Could not delete fee voucher records.');
      }

      setSelectedRows([]);
      setExpandedFeeGroupKey(null);
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Fee payment records deleted successfully.',
        showConfirmButton: false,
        timer: 1200
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: error.message, confirmButtonColor: '#1d4ed8' });
    }
  };

  const handleDeleteFeeGroup = (record) => handleDeleteFeeGroups([record]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentRecords.map(r => r.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected = currentRecords.length > 0 && currentRecords.every(r => selectedRows.includes(r.id));

  const feeColumns = [
    { key: 'month', label: 'Month', width: 240 },
    { key: 'class', label: 'Grade / Section', width: 180 },
    { key: 'amount', label: 'Amount (PKR)', width: 150 },
    { key: 'date', label: 'Due Date', width: 210 },
    { key: 'method', label: 'Method', width: 140 },
    { key: 'status', label: 'Status', width: 120 }
  ];

  const renderFeeCell = (record, column) => {
    if (column.key === 'month') {
      return (
        <div className="fm-fee-cell">
          <span className={`fm-fee-icon color-${Math.max(record.month.length, 1) % 4}`}><SvgFeeDoc /></span>
          <div>
            <button className="fm-month-link" type="button" onClick={() => setExpandedFeeGroupKey(expandedFeeGroupKey === record.id ? null : record.id)}>
              {record.month}
            </button>
            <span className="fm-fee-sub">{record.paidCount}/{record.totalCount} paid</span>
          </div>
        </div>
      );
    }
    if (column.key === 'class') {
      return (
        <span className="fm-class-cell">
          <strong>{record.grade || '-'}</strong>
          <small>Section {record.section || '-'}</small>
        </span>
      );
    }
    if (column.key === 'amount') return formatAmount(record.amount);
    if (column.key === 'date') {
      return (
        <span className="fm-date-cell">
          <SvgDate />
          {record.dueDate ? new Date(record.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
        </span>
      );
    }
    if (column.key === 'method') return record.method || '-';
    if (column.key === 'status') return <span className={`fm-pill ${record.status === 'Unactive' ? 'inactive' : 'paid'}`}>{record.status}</span>;
    return '-';
  };

  const renderFeeGroupDetails = (record) => (
    <div className="fm-fee-expanded">
      <div className="fm-fee-expanded-stats">
        <div><span>Class</span><strong>{record.grade} - Section {record.section}</strong></div>
        <div><span>Total students</span><strong>{record.totalCount}</strong></div>
        <div><span>Paid</span><strong>{record.paidCount}</strong></div>
        <div><span>Unpaid</span><strong>{record.unpaidCount}</strong></div>
      </div>

      <div className="fm-fee-expanded-table">
        <div className="fm-fee-expanded-head">
          <span>Paid</span>
          <span>Unpaid</span>
          <span>Student name</span>
          <span>Student ID</span>
          <span>Class</span>
          <span>Status</span>
        </div>
        {record.students.length > 0 ? record.students.map((student) => {
          const payment = getPaymentForStudentMonth(student.student_id, record.month);
          const isPaid = payment && Number(payment.amount_received || 0) >= Number(payment.amount_due || record.amount || 0);
          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
          return (
            <label className="fm-fee-expanded-row" key={student.student_id}>
              <input
                type="checkbox"
                aria-label={`Mark ${studentName} paid`}
                checked={Boolean(isPaid)}
                onChange={(event) => {
                  if (event.target.checked) handleStudentFeeStatus(record, student, true);
                }}
              />
              <input
                type="checkbox"
                aria-label={`Mark ${studentName} unpaid`}
                checked={!isPaid}
                onChange={(event) => {
                  if (event.target.checked) handleStudentFeeStatus(record, student, false);
                }}
              />
              <span>{studentName}</span>
              <span>{student.student_id || '-'}</span>
              <span>{student.grade || record.grade} - Sec {student.section || record.section}</span>
              <span className={`fm-payment-state ${isPaid ? 'paid' : 'unpaid'}`}>{isPaid ? 'Paid' : 'Unpaid'}</span>
            </label>
          );
        }) : (
          <div className="fm-fee-expanded-empty">No students found for this class and section.</div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout userRole="admin" currentPath="/fees" userName="System Admin" userInitials="SA">
      <div className="fm-page-header">
        <div className="fm-header-left">
          <h2>Fee Management</h2>
          <p>Track and manage all fee structures</p>
        </div>
        <div className="fm-header-right">
          <button className="fm-btn-primary" type="button" onClick={openVoucherModal}><SvgVoucher /> Fee voucher</button>
          <div className="fm-avatar">SA</div>
        </div>
      </div>

      {/* 👉 onDelete linked here */}
      <Header
        onExport={handleExport}
        onRefresh={handleRefresh}
        onDelete={handleDelete}
        onEdit={() => {
          const record = feeGroupRecords.find((item) => item.id === selectedRows[0]);
          selectedRows.length === 1 && record
            ? setExpandedFeeGroupKey(record.id)
            : Swal.fire('Select one fee month', 'Choose exactly one fee month row, then click Edit to open paid/unpaid details.', 'info');
        }}
      />

      <AdminListView
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
          setSelectedRows([]);
        }}
        searchPlaceholder="Search fee structures..."
        searchIcon={<SvgSearch />}
        showConfigure={false}
        columns={feeColumns}
        rows={currentRecords}
        getRowId={(record) => record.id}
        renderCell={renderFeeCell}
        selectedRows={selectedRows}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        renderActions={(record) => (
          <button className="fm-more-btn" type="button" aria-label="Delete fee record" onClick={() => handleDeleteFeeGroup(record)}>
            <SvgMore />
          </button>
        )}
        renderExpandedRow={renderFeeGroupDetails}
        isRowExpanded={(record) => expandedFeeGroupKey === record.id}
        actionsHeader=""
        actionsWidth={70}
        emptyMessage="No fee records found."
        paginationLabel={`Showing ${currentRecords.length > 0 ? indexOfFirstRecord + 1 : 0} to ${Math.min(indexOfLastRecord, filteredRecords.length)} of ${filteredRecords.length} records`}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          setSelectedRows([]);
        }}
      />

      {false && <div className="fm-table-card">
        <div className="fm-search-area">
          <div className="fm-search-box">
            <SvgSearch />
            <input
              type="text"
              placeholder="Search fee structures..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
                setSelectedRows([]);
              }}
            />
          </div>
        </div>

        <div className="fm-table-scroll">
          <table className="fm-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Fee Name <span className="fm-sort">↕</span></th>
                <th>Grade <span className="fm-sort">↕</span></th>
                <th>Amount (PKR) <span className="fm-sort">↕</span></th>
                <th>Due Date <span className="fm-sort">↕</span></th>
                <th>Method <span className="fm-sort">↕</span></th>
                <th>Status <span className="fm-sort">↕</span></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((r) => (
                  <tr key={r.payment_id} className={selectedRows.includes(r.payment_id) ? 'selected-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(r.payment_id)}
                        onChange={() => handleSelectRow(r.payment_id)}
                      />
                    </td>
                    <td>
                      <div className="fm-fee-cell">
                        <span className={`fm-fee-icon color-${r.payment_id % 4}`}><SvgFeeDoc /></span>
                        <div>
                          <span className="fm-fee-name">{getFeeName(r)}</span>
                          <span className="fm-fee-sub">{getFeeSub(r)}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={`fm-grade-pill color-${r.payment_id % 4}`}>{r.grade || '-'}</span></td>
                    <td>{formatAmount(r.amount_received)}</td>
                    <td><span className="fm-date-cell"><SvgDate />{new Date(r.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></td>
                    <td>{r.payment_method}</td>
                    <td><span className="fm-pill paid">Active</span></td>
                    <td><button className="fm-more-btn" type="button" aria-label="More fee actions" onClick={() => Swal.fire(getFeeName(r), `Student: ${r.first_name || ''} ${r.last_name || ''}\nAmount: ${formatAmount(r.amount_received)}\nMethod: ${r.payment_method || '-'}`, 'info')}><SvgMore /></button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No fee records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="fm-pagination-footer">
          <span className="fm-page-info">
            Showing {currentRecords.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
          </span>
          <div className="fm-page-buttons">
            <button className="fm-page-btn" onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); setSelectedRows([]); }} disabled={currentPage === 1}>&lt;</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} className={`fm-page-btn ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => { setCurrentPage(index + 1); setSelectedRows([]); }}>{index + 1}</button>
            ))}
            <button className="fm-page-btn" onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); setSelectedRows([]); }} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
          </div>
        </div>
      </div>}

      {isVoucherOpen && (
        <div className="fm-modal-overlay">
          <div className="fm-modal fm-voucher-modal" role="dialog" aria-modal="true" aria-labelledby="fee-voucher-title">
            <div className="fm-modal-header">
              <div className="fm-modal-title-group">
                <div className="fm-modal-icon"><FeeLineIcon type="voucher" /></div>
                <div className="fm-modal-title">
                  <h2 id="fee-voucher-title">Generate Fee Voucher</h2>
                  <p>Select class, month, amount, dates, and students before generating PDF vouchers</p>
                </div>
              </div>
              <button className="fm-modal-close" type="button" onClick={() => setIsVoucherOpen(false)} aria-label="Close fee voucher form">
                <FeeLineIcon type="close" />
              </button>
            </div>

            <div className="fm-modal-body">
              <div className="fm-modal-card fm-voucher-config-card">
                <div className="fm-section-heading">
                  <span className="fm-step-badge">1</span>
                  <div>
                    <div className="fm-section-title">VOUCHER DETAILS</div>
                    <p className="fm-section-subtitle">Choose class, month, fee amount, issue date, and last date</p>
                  </div>
                </div>

                <div className="fm-voucher-grid">
                  <div className="fm-form-group">
                    <label>Class <span>*</span></label>
                    <div className="fm-input-shell">
                      <select name="classKey" value={voucherForm.classKey} onChange={(event) => handleVoucherClassChange(event.target.value)} className="fm-input">
                        <option value="">Select class</option>
                        {classOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Fee Month <span>*</span></label>
                    <div className="fm-input-shell">
                      <FeeLineIcon type="calendar" />
                      <select name="feeMonth" value={voucherForm.feeMonth} onChange={handleVoucherInput} className="fm-input">
                        {voucherMonthOptions.map((month) => <option key={month}>{month}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Fee Amount (PKR) <span>*</span></label>
                    <div className="fm-input-shell">
                      <span className="fm-currency-chip">Rs</span>
                      <input type="number" min="1" name="amount" value={voucherForm.amount} onChange={handleVoucherInput} className="fm-input" />
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Issue Date <span>*</span></label>
                    <div className="fm-input-shell">
                      <FeeLineIcon type="calendar" />
                      <input type="date" name="issueDate" value={voucherForm.issueDate} onChange={handleVoucherInput} className="fm-input" />
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Last Date <span>*</span></label>
                    <div className="fm-input-shell">
                      <FeeLineIcon type="calendar" />
                      <input type="date" name="lastDate" value={voucherForm.lastDate} onChange={handleVoucherInput} className="fm-input" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="fm-modal-card fm-voucher-students-card">
                <div className="fm-voucher-students-head">
                  <div className="fm-section-heading">
                    <span className="fm-step-badge">2</span>
                    <div>
                      <div className="fm-section-title">SELECT STUDENTS</div>
                      <p className="fm-section-subtitle">Students from the selected class appear below before PDF generation</p>
                    </div>
                  </div>
                  <label className="fm-voucher-select-all">
                    <input
                      type="checkbox"
                      checked={voucherStudents.length > 0 && voucherStudents.every((student) => selectedVoucherStudents.includes(student.student_id))}
                      onChange={(event) => setAllVoucherStudents(event.target.checked)}
                    />
                    Select all
                  </label>
                </div>

                <div className="fm-voucher-summary">
                  <span>Class: <strong>{getSelectedClassInfo().label}</strong></span>
                  <span>Students selected: <strong>{selectedVoucherStudentRecords.length}</strong></span>
                  <span>Amount: <strong>{formatAmount(voucherForm.amount)}</strong></span>
                </div>

                <div className="fm-voucher-student-list">
                  {voucherStudents.length > 0 ? voucherStudents.map((student) => {
                    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
                    return (
                      <label className="fm-voucher-student-row" key={student.student_id}>
                        <input
                          type="checkbox"
                          checked={selectedVoucherStudents.includes(student.student_id)}
                          onChange={() => toggleVoucherStudent(student.student_id)}
                        />
                        <span className="fm-voucher-student-avatar">{`${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase() || 'ST'}</span>
                        <span className="fm-voucher-student-main">
                          <strong>{fullName}</strong>
                          <small>ID: {student.student_id || '-'} | Guardian: {student.guardian_name || '-'}</small>
                        </span>
                        <span className="fm-voucher-student-class">{student.grade || '-'} - {student.section || '-'}</span>
                      </label>
                    );
                  }) : (
                    <div className="fm-voucher-empty">Select a class to preview students before generating vouchers.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="fm-modal-footer">
              <button className="fm-btn-discard" type="button" onClick={() => setIsVoucherOpen(false)}>Cancel</button>
              <button className="fm-btn-publish" type="button" onClick={generateFeeVoucherPdf}>
                <FeeLineIcon type="voucher" /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fm-modal-overlay">
          <div className="fm-modal">
            <div className="fm-modal-header">
              <div className="fm-modal-title-group">
                <div className="fm-modal-icon"><FeeLineIcon type="wallet" /></div>
                <div className="fm-modal-title">
                  <h2>{modalMode === 'edit' ? 'Update Fee Payment' : 'Record Fee Payment'}</h2>
                  <p>Record and save fee payment details for the student</p>
                </div>
              </div>
              <button className="fm-modal-close" type="button" onClick={() => setIsModalOpen(false)} aria-label="Close fee payment form">
                <FeeLineIcon type="close" />
              </button>
            </div>
            <div className="fm-modal-body">
              <div className="fm-modal-card fm-search-card">
                <div className="fm-section-heading">
                  <span className="fm-step-badge">1</span>
                  <div>
                    <div className="fm-section-title">SEARCH STUDENT</div>
                    <p className="fm-section-subtitle">Find and select the student to record the payment</p>
                  </div>
                </div>
                <div className="fm-search-input-shell">
                  <FeeLineIcon type="search" />
                  <input
                    type="text"
                    name="studentSearch"
                    className="fm-input"
                    placeholder="Search by Name or Roll No..."
                    value={studentSearch}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                  />
                </div>
                {selectedStudent && (
                  <div className="fm-student-card">
                    <div className="fm-stu-info">
                      <span className="fm-stu-avatar">{`${selectedStudent.first_name?.[0] || ''}${selectedStudent.last_name?.[0] || ''}`.toUpperCase()}</span>
                      <div className="fm-stu-details">
                        <h4>{selectedStudent.first_name} {selectedStudent.last_name}</h4>
                        <p>Grade {selectedStudent.grade} | Roll: {selectedStudent.roll_no}</p>
                      </div>
                    </div>
                    <div className="fm-stu-fee-info">
                      <h4>{formatAmount(formData.amountReceived)}</h4>
                      <p>Selected student</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="fm-modal-card fm-payment-card">
                <div className="fm-section-heading">
                  <span className="fm-step-badge">2</span>
                  <div>
                    <div className="fm-section-title">PAYMENT INFO</div>
                    <p className="fm-section-subtitle">Enter payment details below</p>
                  </div>
                </div>
                <div className="fm-form-row-2">
                  <div className="fm-form-group">
                    <label>Fee Month <span>*</span></label>
                    <div className="fm-input-shell">
                      <FeeLineIcon type="calendar" />
                      <select name="feeMonth" value={formData.feeMonth} onChange={handleInputChange} className="fm-input">
                        <option>April 2026</option>
                        <option>May 2026</option>
                      </select>
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Amount Received (PKR) <span>*</span></label>
                    <div className="fm-input-shell">
                      <span className="fm-currency-chip">Rs</span>
                      <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleInputChange} className="fm-input" />
                    </div>
                  </div>
                </div>
                <div className="fm-form-row-2">
                  <div className="fm-form-group">
                    <label>Payment Method <span>*</span></label>
                    <div className="fm-input-shell">
                      <FeeLineIcon type="card" />
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="fm-input">
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Online</option>
                      </select>
                    </div>
                  </div>
                  <div className="fm-form-group">
                    <label>Transaction ID</label>
                    <div className="fm-input-shell">
                      <span className="fm-hash-chip">#</span>
                      <input type="text" name="transactionId" value={formData.transactionId} onChange={handleInputChange} className="fm-input" placeholder="Optional" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="fm-modal-footer">
              <button className="fm-btn-discard" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="fm-btn-publish" onClick={handleRecordPayment} disabled={loading}>
                <FeeLineIcon type="save" /> {loading ? 'Processing...' : (modalMode === 'edit' ? 'Update Payment' : 'Save Payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
