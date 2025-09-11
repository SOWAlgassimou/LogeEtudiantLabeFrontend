import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const getUtilisateur = () => {
    try {
      const data = localStorage.getItem("utilisateurConnecte");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  // Charger les notifications depuis localStorage
  useEffect(() => {
    const utilisateur = getUtilisateur();
    if (utilisateur) {
      const loadNotifications = () => {
        const saved = localStorage.getItem(`notifications_${utilisateur._id}`);
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          // Ajouter des notifications de démo au premier chargement
          const demoNotifs = [
            {
              _id: '1',
              titre: 'Bienvenue !',
              contenu: 'Bienvenue sur la plateforme de logement étudiant.',
              type: 'info',
              createdAt: new Date().toISOString(),
              lu: false
            }
          ];
          setNotifications(demoNotifs);
          localStorage.setItem(`notifications_${utilisateur._id}`, JSON.stringify(demoNotifs));
        }
      };
      
      loadNotifications();
      
      // Vérifier les nouvelles notifications toutes les 10 secondes
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  // Sauvegarder les notifications dans localStorage
  const saveNotifications = (newNotifications) => {
    const utilisateur = getUtilisateur();
    if (utilisateur) {
      localStorage.setItem(`notifications_${utilisateur._id}`, JSON.stringify(newNotifications));
    }
  };

  const addNotification = (notification) => {
    const newNotif = {
      _id: Date.now().toString(),
      ...notification,
      createdAt: new Date().toISOString(),
      lu: false
    };
    
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveNotifications(updated);
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n._id === id ? {...n, lu: true} : n);
      saveNotifications(updated);
      return updated;
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.lu).length;
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}