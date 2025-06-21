'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocumentTextIcon, UsersIcon, CogIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

const Sidebar = ({ user, logout }) => {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'My Documents',
      href: '/dashboard/my-docs',
      icon: DocumentTextIcon,
      current: pathname.includes('/my-docs'),
    },
    {
      name: 'Shared Documents',
      href: '/dashboard/shared-docs',
      icon: UsersIcon,
      current: pathname.includes('/shared-docs'),
    },
  ]

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Google Docs Clone</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="h-full w-full rounded-full"
                />
              ) : (
                <span className="text-gray-600 text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="ml-auto p-1 text-gray-400 hover:text-gray-500"
            title="Sign out"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar