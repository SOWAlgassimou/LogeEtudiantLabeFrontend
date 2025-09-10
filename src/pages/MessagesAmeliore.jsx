import { useState, useEffect } from "react";
import { getMessages, sendMessage } from "../api/messages";
import { getReservations, getOwnerReservations } from "../api/reservations";
import { getChambres } from "../api/chambres";
import { useNotifications } from "../context/NotificationContext";

function MessagesAmeliore() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState({ destinataire: "", contenu: "" });
  const [conversationActive, setConversationActive] = useState(null);
  const { addNotification } = useNotifications();

  const getUtilisateur = () => {
    try {
      const data = localStorage.getItem("utilisateurConnecte");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };
  const utilisateur = getUtilisateur();

  useEffect(() => {
    // Charger les contacts selon le rôle
    if (utilisateur?.role === 'etudiant') {
      // Étudiant: récupérer les propriétaires via les chambres
      getChambres()
        .then(data => {
          const chambres = data || [];
          const proprietaires = [];
          const seenIds = new Set();
          
          chambres.forEach(ch => {
            if (ch.proprietaire && !seenIds.has(ch.proprietaire._id || ch.proprietaire)) {
              seenIds.add(ch.proprietaire._id || ch.proprietaire);
              if (typeof ch.proprietaire === 'object') {
                proprietaires.push({
                  _id: ch.proprietaire._id,
                  nom: ch.proprietaire.nom || 'Propriétaire',
                  email: ch.proprietaire.email || 'Email non disponible',
                  role: 'proprietaire'
                });
              }
            }
          });
          setUsers(proprietaires);
        })
        .catch(() => {});
    } else if (utilisateur?.role === 'proprietaire') {
      // Propriétaire: récupérer les étudiants via les réservations
      getOwnerReservations()
        .then(data => {
          const reservations = data?.reservations || data || [];
          const etudiants = [];
          const seenIds = new Set();
          
          reservations.forEach(res => {
            const etudiant = res.etudiant || res.user;
            if (etudiant && !seenIds.has(etudiant._id || etudiant)) {
              seenIds.add(etudiant._id || etudiant);
              if (typeof etudiant === 'object') {
                etudiants.push({
                  _id: etudiant._id,
                  nom: etudiant.nom || 'Étudiant',
                  email: etudiant.email || 'Email non disponible',
                  role: 'etudiant'
                });
              }
            }
          });
          setUsers(etudiants);
        })
        .catch(() => {});
    }
    
    // Récupérer tous les messages
    getMessages()
      .then(data => {
        const messagesList = data?.messages || data || [];
        const mesMessages = messagesList.filter(msg => 
          msg.expediteur?._id === utilisateur?._id || 
          msg.destinataire?._id === utilisateur?._id ||
          msg.expediteur === utilisateur?._id || 
          msg.destinataire === utilisateur?._id
        );
        // Trier par date (plus récent en premier comme WhatsApp)
        mesMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(mesMessages);
      })
      .catch(() => {});
  }, []);

  const envoyerMessage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        destinataire: nouveauMessage.destinataire,
        texte: nouveauMessage.contenu
      };
      await sendMessage(payload);
      
      // Créer une notification pour le destinataire (simulée localement)
      if (conversationActive) {
        const notifKey = `notifications_${nouveauMessage.destinataire}`;
        const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
        const newNotif = {
          _id: Date.now().toString(),
          titre: "Nouveau message",
          contenu: `Vous avez reçu un message de ${utilisateur?.nom || 'un utilisateur'}`,
          type: "message",
          createdAt: new Date().toISOString(),
          lu: false
        };
        existingNotifs.unshift(newNotif);
        localStorage.setItem(notifKey, JSON.stringify(existingNotifs));
        console.log('Notification créée pour:', nouveauMessage.destinataire, newNotif);
        
        // Créer aussi une notification pour l'expéditeur (pour test)
        addNotification({
          titre: "Message envoyé",
          contenu: `Message envoyé à ${conversationActive.nom}`,
          type: "message_sent"
        });
      }
      
      setNouveauMessage({ destinataire: conversationActive?._id || "", contenu: "" });
      
      // Recharger les messages
      const data = await getMessages();
      const messagesList = data?.messages || data || [];
      const mesMessages = messagesList.filter(msg => 
        msg.expediteur?._id === utilisateur?._id || 
        msg.destinataire?._id === utilisateur?._id ||
        msg.expediteur === utilisateur?._id || 
        msg.destinataire === utilisateur?._id
      );
      // Trier par date (plus récent en premier)
      mesMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(mesMessages);
    } catch (e) {
      console.error("Erreur envoi:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des utilisateurs */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Utilisateurs</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.filter(u => u._id !== utilisateur?._id).map(user => (
              <div 
                key={user._id}
                onClick={() => {
                  setConversationActive(user);
                  setNouveauMessage({...nouveauMessage, destinataire: user._id});
                }}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  conversationActive?._id === user._id ? 'bg-blue-100' : ''
                }`}
              >
                <p className="font-medium">{user.nom}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'proprietaire' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="md:col-span-2">
          {conversationActive && (
            <div className="bg-white p-4 rounded shadow mb-4">
              <h3 className="font-semibold mb-2">Conversation avec {conversationActive.nom}</h3>
              <form onSubmit={envoyerMessage} className="flex gap-2">
                <textarea
                  placeholder="Votre message..."
                  value={nouveauMessage.contenu}
                  onChange={(e) => setNouveauMessage({...nouveauMessage, contenu: e.target.value})}
                  className="flex-1 border p-2 rounded h-20 resize-none"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded h-fit">
                  Envoyer
                </button>
              </form>
            </div>
          )}

          {/* Historique des messages */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-4">
              {conversationActive ? `Messages avec ${conversationActive.nom}` : 'Tous les messages'}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">Aucun message pour le moment.</p>
              ) : (
                (() => {
                  const filteredMessages = messages
                    .filter(msg => !conversationActive || 
                      (msg.expediteur?._id === conversationActive._id || msg.destinataire?._id === conversationActive._id))
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                  
                  const groupedMessages = [];
                  let currentDate = null;
                  
                  filteredMessages.forEach(msg => {
                    const msgDate = new Date(msg.createdAt);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    let dateLabel = '';
                    if (msgDate.toDateString() === today.toDateString()) {
                      dateLabel = "Aujourd'hui";
                    } else if (msgDate.toDateString() === yesterday.toDateString()) {
                      dateLabel = "Hier";
                    } else {
                      dateLabel = msgDate.toLocaleDateString('fr-FR');
                    }
                    
                    if (currentDate !== dateLabel) {
                      currentDate = dateLabel;
                      groupedMessages.push({ type: 'date', label: dateLabel });
                    }
                    
                    groupedMessages.push({ type: 'message', data: msg });
                  });
                  
                  return groupedMessages.map((item, i) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${i}`} className="text-center my-4">
                          <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                            {item.label}
                          </span>
                        </div>
                      );
                    } else {
                      const msg = item.data;
                      const isEnvoye = msg.expediteur?._id === utilisateur?._id;
                      return (
                        <div key={msg._id || i} className={`p-3 rounded mb-2 ${
                          isEnvoye ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium">
                              {isEnvoye ? 'Vous' : (msg.expediteur?.nom || 'Utilisateur')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{msg.texte || msg.contenu}</p>
                        </div>
                      );
                    }
                  });
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesAmeliore;