import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Header from '../../components/Header/header';
import { API_BASE, findCurrentStudent, getStoredUser, getStudentInitials, getStudentName } from './studentAccess';
import { getStudentHeaderActions } from './studentHeaderActions';
import { buildStudentFeeRows, getStudentFeeSummary } from './studentFeeSummary';
import './StudentModule.css';

const ProfileIcon = ({ type }) => {
  const paths = {
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    id: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.7-1.4 5.3-1.4 6 0M14 10h4M14 14h4" /></>,
    class: <><path d="M3 10 12 5l9 5-9 5-9-5Z" /><path d="M6 12v5c2 2 10 2 12 0v-5" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />,
    guardian: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="10" r="2" /><path d="M3 21a6 6 0 0 1 12 0M14 21a4 4 0 0 1 7 0" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /></>,
    receipt: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    profileCard: <><rect x="3" y="5" width="13" height="12" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M5.5 15a4 4 0 0 1 5 0" /><path d="m17 12 2 2 4-5" /></>
  };

  return (
    <svg className="sm-profile-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
};

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const studentName = getStudentName(student);
  const initials = getStudentInitials(student);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [studentsResult, feesResult] = await Promise.all([
          fetch(`${API_BASE}/students`).then((r) => r.json()),
          fetch(`${API_BASE}/fees`).then((r) => r.json()),
        ]);
        const currentStudent = studentsResult.success ? findCurrentStudent(studentsResult.data, user) : null;
        const feeRows = feesResult.success ? feesResult.data : [];
        setStudent(currentStudent);
        setFees(feeRows.filter((item) => Number(item.student_id) === Number(currentStudent?.student_id)));
        if (currentStudent?.student_id) {
          const voucherResult = await fetch(`${API_BASE}/fee-vouchers?studentId=${currentStudent.student_id}`).then((r) => r.json());
          setVouchers(voucherResult.success ? voucherResult.data : []);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error('Student profile fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const classLabel = `${student?.grade || '-'} - Section ${student?.section || '-'}`;
  const feeRows = buildStudentFeeRows(fees, vouchers);
  const { totalBilled: totalFees, totalPaid: paidAmount, totalDue: dueAmount, accountStatus: feeStatus } = getStudentFeeSummary(feeRows);

  const studentInfo = [
    { label: 'Full name', value: studentName, icon: 'user', tone: 'blue' },
    { label: 'Roll no', value: student?.roll_no || '-', icon: 'id', tone: 'blue' },
    { label: 'Class', value: classLabel, icon: 'class', tone: 'blue' },
    { label: 'Date of birth', value: student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '-', icon: 'calendar', tone: 'blue' },
    { label: 'Email', value: student?.email || '-', icon: 'mail', tone: 'blue' },
    { label: 'Phone', value: student?.phone || '-', icon: 'phone', tone: 'blue' }
  ];

  const guardianInfo = [
    { label: 'Guardian', value: student?.guardian_name || '-', icon: 'guardian', tone: 'purple' },
    { label: 'Guardian contact', value: student?.guardian_contact || '-', icon: 'phone', tone: 'purple' }
  ];
  const headerActions = getStudentHeaderActions({
    pageName: 'My profile',
    exportFileName: 'student-profile.csv',
    exportColumns: [
      { key: 'field', label: 'Field' },
      { key: 'value', label: 'Value' }
    ],
    exportRows: [
      ...studentInfo.map((item) => ({ field: item.label, value: item.value })),
      ...guardianInfo.map((item) => ({ field: item.label, value: item.value })),
      { field: 'Fee status', value: feeStatus },
      { field: 'Status', value: student?.status || 'Active' },
      { field: 'Total fees', value: `PKR ${totalFees.toFixed(2)}` },
      { field: 'Paid amount', value: `PKR ${paidAmount.toFixed(2)}` },
      { field: 'Due amount', value: `PKR ${dueAmount.toFixed(2)}` }
    ]
  });

  return (
    <DashboardLayout userRole="student" currentPath="/student/profile" userName={studentName} userInitials={initials}>
      <div className="sm-page-header">
        <div>
          <h2>My profile</h2>
          <p>Personal, academic, guardian, and fee information</p>
        </div>
        <a className="sm-avatar sm-avatar-link" href="/student/profile" aria-label="Open profile">{initials}</a>
      </div>

      <Header {...headerActions} />

      {loading ? (
        <section className="sm-panel"><div className="sm-empty">Loading profile...</div></section>
      ) : student ? (
        <div className="sm-profile-page">
          <section className="sm-profile-hero">
            <div className="sm-profile-identity">
              <div className="sm-profile-avatar-lg">{initials}</div>
              <div>
                <div className="sm-profile-name-row">
                  <h3>{studentName}</h3>
                  <span className="sm-pill green">{student.status || 'Active'}</span>
                </div>
                <p>{classLabel}</p>
                <p>Roll No: {student.roll_no || '-'}</p>
              </div>
            </div>
            <div className="sm-profile-hero-art">
              <ProfileIcon type="profileCard" />
            </div>
          </section>

          <div className="sm-profile-layout">
            <section className="sm-profile-card sm-profile-student-card">
              <div className="sm-profile-card-title">
                <span className="sm-profile-title-icon blue"><ProfileIcon type="user" /></span>
                <h3>Student information</h3>
              </div>
              <div className="sm-profile-rows">
                {studentInfo.map((item) => (
                  <div className="sm-profile-row" key={item.label}>
                    <span className={`sm-profile-row-icon ${item.tone}`}><ProfileIcon type={item.icon} /></span>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="sm-profile-side">
              <section className="sm-profile-card">
                <div className="sm-profile-card-title">
                  <span className="sm-profile-title-icon purple"><ProfileIcon type="guardian" /></span>
                  <h3>Guardian information</h3>
                </div>
                <div className="sm-profile-rows">
                  {guardianInfo.map((item) => (
                    <div className="sm-profile-row" key={item.label}>
                      <span className={`sm-profile-row-icon ${item.tone}`}><ProfileIcon type={item.icon} /></span>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="sm-profile-card">
                <div className="sm-profile-card-title">
                  <span className="sm-profile-title-icon green"><ProfileIcon type="building" /></span>
                  <h3>Academic information</h3>
                </div>
                <div className="sm-profile-rows">
                  <div className="sm-profile-row no-icon">
                    <span>Fee status</span>
                    <strong><span className={`sm-pill ${feeStatus === 'Paid' ? 'green' : 'yellow'}`}>{feeStatus}</span></strong>
                  </div>
                  <div className="sm-profile-row no-icon">
                    <span>Status</span>
                    <strong><span className="sm-pill green">{student.status || 'Active'}</span></strong>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="sm-profile-fee-card">
            <div className="sm-profile-card-title">
              <span className="sm-profile-title-icon orange"><ProfileIcon type="receipt" /></span>
              <h3>Fee information</h3>
              <a href="/student/fees">View fee details</a>
            </div>
            <div className="sm-profile-fee-grid">
              <div><span>Total fees</span><strong>PKR {totalFees.toFixed(2)}</strong></div>
              <div><span>Paid amount</span><strong>PKR {paidAmount.toFixed(2)}</strong></div>
              <div><span>Due amount</span><strong>PKR {dueAmount.toFixed(2)}</strong></div>
            </div>
          </section>
        </div>
      ) : (
        <section className="sm-panel"><div className="sm-empty">No profile found for this account.</div></section>
      )}
    </DashboardLayout>
  );
}
