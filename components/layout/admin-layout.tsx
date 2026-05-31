"use client"

import type React from "react"
import { useState } from "react"
import { Layout, Menu, Dropdown, Space, Avatar } from "antd"
import {
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  UserOutlined,
  GiftOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

const { Sider, Content, Header } = Layout

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link href="/admin/profile">Thông tin cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link href="/admin/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark">
        <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ color: "white", margin: 0, fontSize: collapsed ? "12px" : "18px" }}>
            {collapsed ? "📚" : "Nhà Sách Cộng Đồng"}
          </h1>
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link href="/admin">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingOutlined />}>
            <Link href="/admin/books">Quản lý Sách</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<FileTextOutlined />}>
            <Link href="/admin/orders">Quản lý Đơn hàng</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>
            <Link href="/admin/users">Quản lý Người dùng</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<GiftOutlined />}>
            <Link href="/admin/promotions">Quản lý Khuyến mãi</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Dropdown menu={{ items: [] }} overlay={userMenu} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>Admin</span>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff" }}>{children}</Content>
      </Layout>
    </Layout>
  )
}
