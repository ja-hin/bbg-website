import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GripVertical, Save, RotateCcw, ChevronRight, FolderPlus, Minus, Edit2, Check, X } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
  type: "item" | "folder";
  parentId: string | null;
}

const defaultMenuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "BarChart3", order: 1, type: "item", parentId: null },
  { id: "masters", label: "Masters", href: "/admin/masters", icon: "Database", order: 2, type: "item", parentId: null },
  { id: "brands", label: "Brands", href: "/admin/brands", icon: "Tags", order: 3, type: "item", parentId: null },
  { id: "distributors", label: "Referral Partners", href: "/admin/distributors", icon: "Users", order: 4, type: "item", parentId: null },
  { id: "cart", label: "Cart Tracking", href: "/admin/cart-abandonments", icon: "ShoppingCart", order: 5, type: "item", parentId: null },
  { id: "acer-reg", label: "Acer Registrations", href: "/admin/acer-registrations", icon: "Laptop", order: 6, type: "item", parentId: null },
  { id: "acer-imei", label: "Acer IMEI Management", href: "/admin/acer-imei", icon: "Shield", order: 7, type: "item", parentId: null },
  { id: "claim-slabs", label: "Claim Value Slabs", href: "/admin/claim-value-slabs", icon: "Calculator", order: 8, type: "item", parentId: null },
  { id: "smtp", label: "SMTP Settings", href: "/admin/smtp-settings", icon: "Mail", order: 9, type: "item", parentId: null },
  { id: "whatsapp", label: "WhatsApp Settings", href: "/admin/whatsapp-settings", icon: "MessageCircle", order: 10, type: "item", parentId: null },
  { id: "communication", label: "Communication", href: "/admin/templates", icon: "MessageSquare", order: 11, type: "item", parentId: null },
  { id: "menu-settings", label: "Menu Settings", href: "/admin/menu-settings", icon: "Settings", order: 12, type: "item", parentId: null },
  { id: "logs", label: "System Logs", href: "/admin/logs", icon: "Activity", order: 13, type: "item", parentId: null },
  { id: "whatsapp-test", label: "WhatsApp Test", href: "/admin/whatsapp-test", icon: "MessageCircle", order: 14, type: "item", parentId: null }
];

function AdminMenuSettingsContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current menu order from backend
  const { data: menuOrderData } = useQuery({
    queryKey: ["/api/admin/menu-order"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize menu items from backend data
  useEffect(() => {
    if (menuOrderData?.menuItems) {
      setMenuItems(menuOrderData.menuItems);
    }
  }, [menuOrderData]);

  const saveOrderMutation = useMutation({
    mutationFn: async (items: MenuItem[]) => {
      const response = await fetch("/api/admin/menu-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ menuItems: items }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Menu Order Saved",
        description: "Menu order has been successfully updated"
      });
      // Invalidate menu order query to update sidebar immediately
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-order"] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save menu order",
        variant: "destructive"
      });
    }
  });

  const resetOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/menu-order/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      setMenuItems(defaultMenuItems);
      toast({
        title: "Menu Reset",
        description: "Menu order has been reset to default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-order"] });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset menu order",
        variant: "destructive"
      });
    }
  });

  const createFolder = () => {
    const newFolderId = `folder-${Date.now()}`;
    const newFolder: MenuItem = {
      id: newFolderId,
      label: "New Folder",
      href: "#",
      icon: "Folder",
      order: menuItems.length + 1,
      type: "folder",
      parentId: null
    };
    setMenuItems([...menuItems, newFolder]);
  };

  const convertToSubmenu = (itemId: string, parentId: string) => {
    const updatedItems = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, parentId, type: "item" as const };
      }
      return item;
    });
    
    // Reorder items
    const reorderedItems = reorderMenuItems(updatedItems);
    setMenuItems(reorderedItems);
  };

  const removeFromSubmenu = (itemId: string) => {
    const updatedItems = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, parentId: null };
      }
      return item;
    });
    
    // Reorder items
    const reorderedItems = reorderMenuItems(updatedItems);
    setMenuItems(reorderedItems);
  };

  const deleteItem = (itemId: string) => {
    // Remove the item and any children
    const updatedItems = menuItems.filter(item => 
      item.id !== itemId && item.parentId !== itemId
    );
    
    // Reorder remaining items
    const reorderedItems = reorderMenuItems(updatedItems);
    setMenuItems(reorderedItems);
  };

  const startEditingFolder = (folderId: string, currentName: string) => {
    setEditingFolder(folderId);
    setEditingName(currentName);
  };

  const saveEditingFolder = () => {
    if (editingFolder && editingName.trim()) {
      const updatedItems = menuItems.map(item => {
        if (item.id === editingFolder) {
          return { ...item, label: editingName.trim() };
        }
        return item;
      });
      setMenuItems(updatedItems);
    }
    setEditingFolder(null);
    setEditingName("");
  };

  const cancelEditingFolder = () => {
    setEditingFolder(null);
    setEditingName("");
  };

  const reorderMenuItems = (items: MenuItem[]) => {
    const parentItems = items.filter(item => !item.parentId);
    const childItems = items.filter(item => item.parentId);
    
    let order = 1;
    const reorderedItems: MenuItem[] = [];
    
    parentItems.forEach(parent => {
      reorderedItems.push({ ...parent, order: order++ });
      const children = childItems.filter(child => child.parentId === parent.id);
      children.forEach(child => {
        reorderedItems.push({ ...child, order: order++ });
      });
    });
    
    return reorderedItems;
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Handle dropping into different contexts
    if (destination.droppableId.startsWith('submenu-')) {
      // Dropped into a submenu
      const parentId = destination.droppableId.replace('submenu-', '');
      convertToSubmenu(draggableId, parentId);
    } else if (source.droppableId.startsWith('submenu-') && destination.droppableId === 'menu-list') {
      // Moved from submenu to main menu
      removeFromSubmenu(draggableId);
    } else {
      // Regular reordering
      const items = Array.from(menuItems);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      // Update the order property
      const updatedItems = reorderMenuItems(items);
      setMenuItems(updatedItems);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Settings</h1>
          <p className="text-gray-600">Drag and drop to reorder menu items</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={createFolder}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Folder
          </Button>
          <Button
            variant="outline"
            onClick={() => resetOrderMutation.mutate()}
            disabled={resetOrderMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            onClick={() => saveOrderMutation.mutate(menuItems)}
            disabled={saveOrderMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Order
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Menu Items</CardTitle>
          <p className="text-sm text-gray-600">
            Drag items into folders to create submenus. Drag them out to make them top-level items.
          </p>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {menuItems
                    .filter(item => !item.parentId)
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => {
                      const children = menuItems.filter(child => child.parentId === item.id);
                      const isFolder = item.type === "folder" || children.length > 0;
                      
                      return (
                        <div key={item.id} className="space-y-2">
                          <Draggable draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  flex items-center p-4 border rounded-lg shadow-sm
                                  ${snapshot.isDragging ? "shadow-lg border-blue-300 bg-blue-50" : "bg-white hover:shadow-md"}
                                  ${isFolder ? "border-l-4 border-l-orange-400" : ""}
                                  transition-all duration-200
                                `}
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-sm font-medium text-gray-500">
                                        #{item.order}
                                      </span>
                                      <span className="font-medium flex items-center">
                                        {isFolder && <ChevronRight className="w-4 h-4 mr-1 text-orange-500" />}
                                        {editingFolder === item.id ? (
                                          <input
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') saveEditingFolder();
                                              if (e.key === 'Escape') cancelEditingFolder();
                                            }}
                                            className="px-2 py-1 border rounded text-sm"
                                            autoFocus
                                            onBlur={saveEditingFolder}
                                          />
                                        ) : (
                                          item.label
                                        )}
                                      </span>
                                      {!isFolder && (
                                        <span className="text-sm text-gray-500">{item.href}</span>
                                      )}
                                      {isFolder && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                          {children.length} item{children.length !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex space-x-2">
                                      {item.type === "folder" && (
                                        <>
                                          {editingFolder === item.id ? (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={saveEditingFolder}
                                                className="text-green-600 hover:text-green-700"
                                              >
                                                <Check className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={cancelEditingFolder}
                                                className="text-gray-600 hover:text-gray-700"
                                              >
                                                <X className="w-4 h-4" />
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditingFolder(item.id, item.label)}
                                                className="text-blue-600 hover:text-blue-700"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteItem(item.id)}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <Minus className="w-4 h-4" />
                                              </Button>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                          
                          {/* Submenu items */}
                          {isFolder && (
                            <div className="ml-8 border-l-2 border-gray-200 pl-4">
                              <Droppable droppableId={`submenu-${item.id}`}>
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`
                                      space-y-2 min-h-[50px] p-2 rounded border-2 border-dashed
                                      ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "border-gray-300"}
                                      transition-all duration-200
                                    `}
                                  >
                                    {children.length === 0 && (
                                      <div className="text-center text-gray-400 text-sm py-4">
                                        Drop items here to create submenu
                                      </div>
                                    )}
                                    {children
                                      .sort((a, b) => a.order - b.order)
                                      .map((child, childIndex) => (
                                        <Draggable key={child.id} draggableId={child.id} index={childIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`
                                                flex items-center p-3 bg-gray-50 border rounded shadow-sm
                                                ${snapshot.isDragging ? "shadow-lg border-blue-300 bg-blue-50" : "hover:shadow-md"}
                                                transition-all duration-200
                                              `}
                                            >
                                              <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
                                              <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-xs font-medium text-gray-500">
                                                    #{child.order}
                                                  </span>
                                                  <span className="text-sm font-medium">{child.label}</span>
                                                  <span className="text-xs text-gray-500">{child.href}</span>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800">How to Use</h3>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• <strong>Create folders:</strong> Click "Add Folder" to create new menu groups</li>
          <li>• <strong>Make submenus:</strong> Drag menu items into folder drop zones</li>
          <li>• <strong>Remove from submenus:</strong> Drag items back to the main menu area</li>
          <li>• <strong>Delete folders:</strong> Use the minus button next to empty folders</li>
          <li>• <strong>Reorder:</strong> Drag items up/down to change their position</li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminMenuSettings() {
  return (
    <AdminLayout>
      <AdminMenuSettingsContent />
    </AdminLayout>
  );
}