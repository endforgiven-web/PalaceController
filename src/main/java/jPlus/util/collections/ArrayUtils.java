package jPlus.util.collections;

import jPlus.lang.Tuple2;
import jPlus.util.lang.IntUtils;

import java.lang.reflect.Array;
import java.util.Arrays;

public final class ArrayUtils {

    public static <T> T[] concat(T[] array1, T[] array2) {
        T[] result = Arrays.copyOf(array1, array1.length + array2.length);
        System.arraycopy(array2, 0, result, array1.length, array2.length);
        return result;
    }

    //***************************************************************//

    public static Integer[][] rotateCCW(Integer[][] arr) {
        return (arr.length > 0)
                ? rotateCCW(arr, new Integer[arr[0].length][arr.length])
                : arr;
    }

    public static <E> E[][] rotateCCW(E[][] arr, E[][] ret) {
        final int outerL = arr.length;
        if (outerL > 0) {
            for (int i = 0; i < arr[0].length; ++i)
                for (int j = 0; j < outerL; ++j)
                    ret[i][j] = arr[outerL - j - 1][i]; //***

            return ret;
        } else return arr;
    }

    public static <E> boolean twoDArrEquals(E[][] arr1, E[][] arr2) {
        if (arr1.length != arr2.length) return false;
        for (int i = 0; i < arr1.length; i++) if (!Arrays.equals(arr1[i], arr2[i])) return false;

        return true;
    }

    public static Integer[][] filled2D(int outer, int inner, int v) {
        final Integer[][] ret = new Integer[outer][inner];
        for (Integer[] innerArr : ret)
            Arrays.fill(innerArr, v);
        return ret;
    }

    public static Boolean[] filled(int length, Boolean v){
        final Boolean[] ret = new Boolean[length];
        Arrays.fill(ret, true);
        return ret;
    }

    //***************************************************************//

    @SuppressWarnings("unchecked")
    public static <E> E[] of(Class<E> clazz, int size) {
        return (E[]) Array.newInstance(clazz, size);
    }

    public static <E> E[] reverse(E[] arr, Class<E> clazz) {
        E[] ret = of(clazz, arr.length);
        int j = arr.length;
        for (E e : arr) {
            ret[j - 1] = e;
            j--;
        }

        return ret;
    }

    public static <E> int countCells(E[][] arrays) {
        int ret = 0;
        for (E[] arr : arrays) ret += arr.length;
        return ret;
    }

    public static <E> Tuple2<Integer, Integer> countCellsAndMax(E[][] arrays) {
        int count = 0;
        int max = 0;
        for (E[] arr : arrays) {
            max = Math.max(max, arr.length);
            count += arr.length;
        }
        return new Tuple2<>(count, max);
    }

    public static <E> E random(E[] arr) {
        return arr.length > 0 ? arr[IntUtils.random(0, arr.length - 1)] : null;
    }

    //***************************************************************//

    public static <E> E[] merge(E[] a, E[] b) {
        int aLen = a.length;
        int bLen = b.length;

        @SuppressWarnings("unchecked")
        E[] c = (E[]) Array.newInstance(a.getClass().getComponentType(), aLen + bLen);
        System.arraycopy(a, 0, c, 0, aLen);
        System.arraycopy(b, 0, c, aLen, bLen);
        return c;
    }

    public static <E> E[] append(E[] a, E[] b) {
        return merge(a, b);
    }

    public static <E> E[] prepend(E[] a, E[] b) {
        return merge(b, a);
    }

    public static <E> E[] append(E[] a, E b) {
        @SuppressWarnings("unchecked") final E[] bArr = (E[]) Array.newInstance(a.getClass().getComponentType(), 1);
        bArr[0] = b;
        return merge(a, bArr);
    }

    public static <E> E[] prepend(E[] a, E b) {
        @SuppressWarnings("unchecked") final E[] bArr = (E[]) Array.newInstance(a.getClass().getComponentType(), 1);
        bArr[0] = b;
        return merge(bArr, a);
    }

    public static <E> E[] flatten(E[][] arrays, Class<E> clazz, Class<E[]> clazz2, FlattenType flattenType) {
        switch (flattenType) {
            default:
            case ASC:
                return asc(arrays, clazz);
            case DESC:
                return desc(arrays, clazz, clazz2);
            case IL:
                return interleaveX(arrays, clazz);
        }
    }

    public static <E> E[] asc(E[][] arrays, Class<E> clazz) {
        final int count = countCells(arrays);
        final E[] ret = of(clazz, count);
        int index = 0;
        for (E[] arr : arrays) for (E item : arr) ret[index++] = item;
        return ret;
    }

    public static <E> E[] desc(E[][] arrays, Class<E> clazz, Class<E[]> clazz2) {
        return asc(reverse(arrays, clazz2), clazz);
    }

    public static <E> E[] interleaveX(E[][] arrays, Class<E> clazz) {
        final Tuple2<Integer, Integer> countAndMax = countCellsAndMax(arrays);
        final E[] ret = of(clazz, countAndMax.a);

        int retIndex = 0;
        for (int i = 0; i < countAndMax.b; i++) {
            for (E[] arr : arrays) {
                if (i >= arr.length) continue;
                ret[retIndex] = arr[i];
                retIndex++;
            }
        }

        return ret;
    }

    public enum FlattenType {
        ASC,
        DESC,
        IL
    }
}
