import React, { useState } from "react";
import { FolderOpen, File, ChevronRight, ChevronDown } from "lucide-react";

const TreeNode = ({ name, children, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = children && Object.keys(children).length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {isFolder &&
          (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        {isFolder ? (
          <FolderOpen size={16} className="text-blue-500" />
        ) : (
          <File size={16} className="text-gray-500" />
        )}
        <span className="text-sm">{name}</span>
      </div>

      {isFolder && isOpen && (
        <div>
          {Object.entries(children).map(([childName, childData]) => (
            <TreeNode
              key={childName}
              name={childName}
              children={childData}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTreeViewer = () => {
  const [treeData, setTreeData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const buildFileTree = (items) => {
    const tree = {};

    for (let item of items) {
      const parts = item.webkitRelativePath.split("/");
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part) {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }

    return tree;
  };

  const handleFileSelect = (event) => {
    const items = event.target.files;
    if (items.length > 0) {
      const tree = buildFileTree(items);
      setTreeData(tree);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const items = event.dataTransfer.items;
    if (items) {
      const fileEntries = [];

      const readEntries = async (entry) => {
        if (entry.isFile) {
          fileEntries.push(entry.fullPath);
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          const entries = await new Promise((resolve) => {
            reader.readEntries(resolve);
          });

          for (let childEntry of entries) {
            await readEntries(childEntry);
          }
        }
      };

      const processItems = async () => {
        for (let item of items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await readEntries(entry);
          }
        }

        const tree = {};
        for (let path of fileEntries) {
          const parts = path.split("/");
          let current = tree;

          for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }

        setTreeData(tree);
      };

      processItems();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          webkitdirectory="true"
          className="hidden"
          onChange={handleFileSelect}
          id="folder-input"
        />
        <label htmlFor="folder-input" className="cursor-pointer text-gray-600">
          <FolderOpen className="mx-auto mb-2" size={32} />
          <p>Drop a folder here or click to select</p>
        </label>
      </div>

      {treeData && (
        <div className="border rounded-lg p-4 bg-white">
          <TreeNode name="Root" children={treeData} />
        </div>
      )}
    </div>
  );
};

export default FolderTreeViewer;
