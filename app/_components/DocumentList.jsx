"use client";

import Link from "next/link";
import {
  TrashIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "../_lib/utils";

const DocumentList = ({ 
  documents = [], 
  onDelete, 
  showOwner,
  isSharedPage = false // New prop to identify shared docs page
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No documents found. Create a new one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <Link href={`/editor/${doc._id}`} className="block">
                <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600 truncate">
                  {doc.title || "Untitled Document"}
                </h3>
              </Link>
              {/* Only show delete button if not on shared page AND onDelete exists */}
              {!isSharedPage && onDelete && (
                <button
                  onClick={() => onDelete(doc._id)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Delete document"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {showOwner && doc.owner && (
              <p className="mt-1 text-sm text-gray-500">
                Owner: {doc.owner.name}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-500">
              Last updated: {formatDate(doc.updatedAt)}
            </p>
          </div>

          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
            <Link href={`/editor/${doc._id}`}>
              <span className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;