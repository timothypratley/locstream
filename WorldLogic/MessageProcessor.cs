using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using log4net;
using SpatialModel;

namespace WorldLogic {
    public class MessageProcessor {
        public WorldModel World { get; private set; }

        readonly ILog _log = LogManager.GetLogger(typeof(MessageProcessor));

        public MessageProcessor(WorldModel world) {
            World = world;
        }

        public void CheckAndProcessMessage(User user, dynamic message) {
            //TODO: why don't these work?
            //Contract.Requires<ArgumentNullException>(client != null);
            //Contract.Requires<ArgumentNullException>(message != null);

            // new connection... only allow login);
            if (!user.Authenticated && !(message is Login)) {
                _log.Warn("Non-login message " + message.GetType() + " from " + user.RemoteEndPoint);
                return;
            }

            if (user.Avatar == null
                && !(message is PossessMobile
                     || message is RequestPossessable
                     || message is Logout
                     || message is Login)) {
                _log.Warn("ERROR: Non-posses message " + message.GetType() + " from " + user.RemoteEndPoint);
                return;
            }

            try {
                ProcessMessage(user, message);
                _log.Debug("Processed message " + message);
            } catch {
                _log.Warn("Unable to process message " + message);
            }
        }

        void ProcessMessage(User user, Login loginMessage) {
            if (World.UserLookup(loginMessage.Username, loginMessage.Password)) {
                // login succeeded, check there is not an existing connection for this player
                ClientConnection current;
                if (World.Users.TryGetValue(loginMessage.Username, out current))
                    current.Close();

                _log.Info("User " + loginMessage.Username + " logged in");
                user.AuthenticatedUsername = loginMessage.Username;
                World.Users.Add(loginMessage.Username, user);
            } else {
                _log.Info("Login failed for username '" + loginMessage.Username + "'");
                user.Close();
            }
        }

        public Tuple<int, string>[] GetPossessable(string username) {
            DataRow[] dr = Global.Schema.Player.Select("Email = '" + username + "'");
            Schema.PlayerRow pr = Global.Schema.Player.FindByPlayerID((int)dr[0][0]);
            Schema.MobilePossesableByPlayerRow[] mpbpr = pr.GetMobilePossesableByPlayerRows();
            return mpbpr.Select(mpr => new Tuple<int, string>(
                mpr.ObjectInstanceID, mpr.ObjectInstanceRow.TemplateObjectRow.TemplateObjectName)).ToArray();
        }

        void ProcessMessage(User user, RequestPossessable message) {
            //Strive.Data.MultiverseFactory.refreshMultiverseForPlayer(Global.modelSchema, client.PlayerID);
            user.CanPossess(GetPossessable(user.AuthenticatedUsername));
        }

        void ProcessMessage(User user, Logout message) {
            if (user.Avatar != null) {
                // remove from world.
                // TODO: do I want to remove the avatar?
                // World.Remove((EntityModel)client.Avatar);
            }
            _log.Info("Logged out '" + user.AuthenticatedUsername + "'.");
            user.Close();
        }
    }
}
