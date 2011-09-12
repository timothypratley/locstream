using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using log4net;
using SpatialModel;
using System.Diagnostics.Contracts;
using System.Windows.Media.Media3D;

namespace WorldLogic {
    public class Login {
        public string Username;
        public string Password;
    }

    public static class MessageProcessor {
        static readonly ILog _log = LogManager.GetLogger(typeof(MessageProcessor));
        static WorldModel _world;
        static User _user;
        static string _errorMessage;
        public static object CheckAndProcessMessage(this WorldModel world, User user, dynamic message, out string errorMessage) {
            // fark why don't contracts work omg
            //Contract.Requires<ArgumentNullException>(message != null);

            // world and user are set as context so that process message doesn't need to pass them for every call
            _world = world;
            _user = user;

            errorMessage = null;

            /*
            // new connection... only allow login);
            if (!user.Authenticated && !(message is Login)) {
                errorMessage = "Non-login message " + message.GetType();
                return null;
            }

            if (user.Avatar == null
                && !(message is Login)) {
                errorMessage = "ERROR: Non-posses message " + message.GetType();
                return null;
            }
            */

            try {
                var result = ProcessMessage(message);
                _log.Debug("Processed message " + message);
                return result;
            } catch (Exception exception) {
                _log.Warn("Unable to process message " + message, exception);
                errorMessage = exception.Message;
            }

            return null;
        }

        static object ProcessMessage(object message) {
            _errorMessage = "Unknown message " + message;
            return null;
        }

        static object ProcessMessage(Login loginMessage) {
            _log.Info("User " + loginMessage.Username + " logged in");
            _user.Name = loginMessage.Username;
            return null;
        }

        static object ProcessMessage(SpatialEntity entity) {
            return null;
        }

        static object ProcessMessage(Commands.Update update) {
            return new SpatialEntity(update.name, "player", new Vector3D(update.x, update.y, update.z), Quaternion.Identity);
        }

        static object ProcessMessage(Commands.Remove remove) {
            return new Events.Remove() { name = remove.name };
        }
    }
}
