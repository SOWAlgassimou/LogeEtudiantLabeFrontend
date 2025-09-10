import { useNotifications } from "../context/NotificationContext";

function Notifications({ onNavigateToMessages }) {
  const { notifications, markAsRead, addNotification } = useNotifications();

  const marquerLu = (id) => {
    markAsRead(id);
  };

  const handleNotificationClick = (notif) => {
    marquerLu(notif._id);
    if (notif.type === 'message' && onNavigateToMessages) {
      onNavigateToMessages();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>
        
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">Aucune notification pour le moment.</p>
          ) : (
            notifications.map((notif, i) => (
            <div 
              key={notif._id || i} 
              className={`p-4 rounded shadow cursor-pointer hover:shadow-lg transition-shadow ${
                notif.lu ? 'bg-gray-100' : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
              onClick={() => handleNotificationClick(notif)}
            >
              <h3 className="font-semibold">{notif.titre}</h3>
              <p className="mt-2">{notif.contenu}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
              {!notif.lu && (
                <span className="inline-block mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Nouveau
                </span>
              )}
            </div>
            ))
          )}
        </div>
    </div>
  );
}

export default Notifications;