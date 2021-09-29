/**
 * <p>
 * Licensed under the GNU LESSER GENERAL PUBLIC LICENSE 3.0;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.gnu.org/licenses/lgpl.html
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.dftools.netconf.netconfSub.tool.api;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.lang.Nullable;
import org.springframework.util.ObjectUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.Serializable;
import java.util.Optional;

@Getter
@Setter
@ToString

@NoArgsConstructor
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final String DEFAULT_NULL_MESSAGE = "no data";
    private static final String DEFAULT_FAILURE_MESSAGE = "operation failed";
    private static String DEFAULT_SUCCESS_MESSAGE = "operation success";

    private int code;
    private boolean success;
    private T data;
    private String msg;

    private R(IResultCode resultCode) {
        this(resultCode, null, resultCode.getMessage());
    }

    private R(IResultCode resultCode, String msg) {
        this(resultCode, null, msg);
    }

    private R(IResultCode resultCode, T data) {
        this(resultCode, data, resultCode.getMessage());
    }

    private R(IResultCode resultCode, T data, String msg) {
        this(resultCode.getCode(), data, msg);
    }

    private R(int code, T data, String msg) {
        this.code = code;
        this.data = data;
        this.msg = msg;
        this.success = ResultCode.SUCCESS.code == code;
    }


    public static boolean isSuccess(@Nullable R<?> result) {
        return Optional.ofNullable(result)
                .map(x -> ObjectUtils.nullSafeEquals(ResultCode.SUCCESS.code, x.code))
                .orElse(Boolean.FALSE);
    }


    public static boolean isNotSuccess(@Nullable R<?> result) {
        return !R.isSuccess(result);
    }


    public static <T> R<T> data(T data) {
        return data(data, DEFAULT_SUCCESS_MESSAGE);
    }


    public static <T> R<T> data(T data, String msg) {
        return data(HttpServletResponse.SC_OK, data, msg);
    }


    public static <T> R<T> data(int code, T data, String msg) {
        return new R<>(code, data, data == null ? DEFAULT_NULL_MESSAGE : msg);
    }


    public static <T> R<T> success(String msg) {
        return new R<>(ResultCode.SUCCESS, msg);
    }

    public static <T> R<T> success(IResultCode resultCode) {
        return new R<>(resultCode);
    }


    public static <T> R<T> success(IResultCode resultCode, String msg) {
        return new R<>(resultCode, msg);
    }

    public static <T> R<T> fail(String msg) {
        return new R<>(ResultCode.FAILURE, msg);
    }


    public static <T> R<T> fail(int code, String msg) {
        return new R<>(code, null, msg);
    }


    public static <T> R<T> fail(IResultCode resultCode) {
        return new R<>(resultCode);
    }


    public static <T> R<T> fail(IResultCode resultCode, String msg) {
        return new R<>(resultCode, msg);
    }


    public static <T> R<T> status(boolean flag) {
        return flag ? success(DEFAULT_SUCCESS_MESSAGE) : fail(DEFAULT_FAILURE_MESSAGE);
    }

}
