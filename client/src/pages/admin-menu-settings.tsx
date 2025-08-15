import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GripVertical, Save, RotateCcw } from "lucide-react";
import { AdminLayout } from "@/components/admin-layout";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  order: number;
}

const defaultMenuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "BarChart3", order: 1 },
  { id: "masters", label: "Masters", href: "/admin/masters", icon: "Database", order: 2 },
  { id: "brands", label: "Brands", href: "/admin/brands", icon: "Tags", order: 3 },
  { id: "distributors", label: "Referral Partners", href: "/admin/distributors", icon: "Users", order: 4 },
  { id: "cart", label: "Cart Tracking", href: "/admin/cart-abandonments", icon: "ShoppingCart", order: 5 },
  { id: "acer-reg", label: "Acer Registrations", href: "/admin/acer-registrations", icon: "Laptop", order: 6 },
  { id: "acer-imei", label: "Acer IMEI Management", href: "/admin/acer-imei", icon: "Shield", order: 7 },
  { id: "claim-slabs", label: "Claim Value Slabs", href: "/admin/claim-value-slabs", icon: "Calculator", order: 8 },
  { id: "smtp", label: "SMTP Settings", href: "/admin/smtp-settings", icon: "Mail", order: 9 },
  { id: "whatsapp", label: "WhatsApp Settings", href: "/admin/whatsapp-settings", icon: "MessageCircle", order: 10 },
  { id: "communication", label: "Communication", href: "/admin/templates", icon: "MessageSquare", order: 11 },
  { id: "logs", label: "System Logs", href: "/admin/logs", icon: "Activity", order: 12 },
  { id: "whatsapp-test", label: "WhatsApp Test", href: "/admin/whatsapp-test", icon: "MessageCircle", order: 13 }
];

function AdminMenuSettingsContent() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setMenuItems(updatedItems);
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
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {menuItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`
                            flex items-center p-4 bg-white border rounded-lg shadow-sm
                            ${snapshot.isDragging ? "shadow-lg border-blue-300" : "hover:shadow-md"}
                            transition-all duration-200
                          `}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">
                                #{item.order}
                              </span>
                              <span className="font-medium">{item.label}</span>
                              <span className="text-sm text-gray-500">{item.href}</span>
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
          </DragDropContext>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800">Note</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Menu order changes will apply immediately after saving. The "Dashboard" item should generally remain at the top for best user experience.
        </p>
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