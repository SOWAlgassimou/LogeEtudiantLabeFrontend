import { useState, useEffect } from "react";
import { getMessages, sendMessage } from "../api/messages";
import { getUsers } from "../api/users";
import BarreNavigation from "../composants/BarreNavigation";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState({ destinataire: "", contenu: "" });
  const [conversationActive, setConversationActive] = useState(null);

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
    // Charger les utilisateurs
    getUsers()
      .then(data => setUsers(data?.users || data || []))
      .catch(() => {});
    
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
      setNouveauMessage({ destinataire: "", contenu: "" });
      // Recharger tous les messages et filtrer
      const data = await getMessages();
      const messagesList = data?.messages || data || [];
      const mesMessages = messagesList.filter(msg => 
        msg.expediteur?._id === utilisateur?._id || 
        msg.destinataire?._id === utilisateur?._id ||
        msg.expediteur === utilisateur?._id || 
        msg.destinataire === utilisateur?._id
      );
      setMessages(mesMessages);
    } catch (e) {
      console.error("Erreur envoi:", e);
    }
  };

  return (
    <div>
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Messages</h2>
        
        <form onSubmit={envoyerMessage} className="mb-6 bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="ID du destinataire (ex: 68c04dab32e7c42f13e1c429)"
            value={nouveauMessage.destinataire}
            onChange={(e) => setNouveauMessage({...nouveauMessage, destinataire: e.target.value})}
            className="w-full border p-2 rounded mb-3"
            required
          />
          <textarea
            placeholder="Votre message..."
            value={nouveauMessage.contenu}
            onChange={(e) => setNouveauMessage({...nouveauMessage, contenu: e.target.value})}
            className="w-full border p-2 rounded mb-3 h-24"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Envoyer
          </button>
        </form>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">Aucun message pour le moment.</p>
          ) : (
            messages.map((msg, i) => {
              const isEnvoye = msg.expediteur?._id === utilisateur?._id;
              return (
                <div key={msg._id || i} className={`p-4 rounded shadow ${
                  isEnvoye ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-400'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p><strong>{isEnvoye ? 'Envoyé à:' : 'Reçu de:'}</strong> {isEnvoye ? msg.destinataire?.email || msg.destinataire?.nom : msg.expediteur?.email || msg.expediteur?.nom}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isEnvoye ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {isEnvoye ? 'Envoyé' : 'Reçu'}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{msg.texte || msg.contenu}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Messages;