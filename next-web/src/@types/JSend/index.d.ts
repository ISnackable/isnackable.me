/**
 * This file is part of the isnackable.me project.
 * Copyright © 2021-2022 isnackable.me. All rights reserved.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// https://github.com/omniti-labs/jsend
// With some of my own customization

// All went well, and (usually) some data was returned.
interface Success {
  status: "success";
  message: string;
  data?: object;
}

// There was a problem with the data submitted, or some pre-condition of the API call wasn't satisfied
interface Fail {
  status: "fail";
  message: string;
  data?: object;
}

// An error occurred in processing the request, i.e. an exception was thrown
interface Error {
  status: "error";
  message: string;
  code?: number;
  data?: object;
}

export type JSend = Success | Fail | Error;
