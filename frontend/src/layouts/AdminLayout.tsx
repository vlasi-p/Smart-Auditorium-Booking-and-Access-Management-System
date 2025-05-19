//src/layouts/AdminLayout.tsx

const AdminLayout = ({ children }: { children: React.ReactNode }) => (

    <div className="admin-container">
    {/* Custom Admin styling/components like Sidebar */}
        <main className="admin-content">{children}</main>
    </div>
);
    
export default AdminLayout;