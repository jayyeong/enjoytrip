package enjoytrip;

import java.util.*;

/** Pure algorithms. No networking, UI, or mutable application state. */
public final class Algorithms {
    private Algorithms() {}
    public record Spot(String id, String title, String address, double lat, double lon) {}
    public record Ranked(Spot spot, int inputIndex, double km) {}
    public static String normalize(String value) { return value.toLowerCase(Locale.ROOT); }

    public static int[] prefix(String pattern) {
        int[] pi = new int[pattern.length()];
        for (int i=1,j=0;i<pattern.length();i++) {
            while(j>0 && pattern.charAt(i)!=pattern.charAt(j)) j=pi[j-1];
            if(pattern.charAt(i)==pattern.charAt(j)) pi[i]=++j;
        }
        return pi;
    }
    public static boolean containsKmp(String text, String pattern, int[] pi) {
        if(pattern.isEmpty()) return true;
        for(int i=0,j=0;i<text.length();i++) {
            while(j>0 && text.charAt(i)!=pattern.charAt(j)) j=pi[j-1];
            if(text.charAt(i)==pattern.charAt(j) && ++j==pattern.length()) return true;
        }
        return false;
    }
    /** Educational baseline, not the browser's native String.includes implementation. */
    public static boolean containsNaive(String text, String pattern) {
        for(int i=0;i<=text.length()-pattern.length();i++) {
            int j=0;while(j<pattern.length() && text.charAt(i+j)==pattern.charAt(j)) j++;
            if(j==pattern.length()) return true;
        }
        return false;
    }
    public static boolean validCoordinate(double lat,double lon) {
        return Double.isFinite(lat)&&Double.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
    }
    public static double distance(double lat1,double lon1,double lat2,double lon2) {
        if(!validCoordinate(lat1,lon1)||!validCoordinate(lat2,lon2)) return Double.POSITIVE_INFINITY;
        double a=Math.pow(Math.sin(Math.toRadians(lat2-lat1)/2),2)
            +Math.cos(Math.toRadians(lat1))*Math.cos(Math.toRadians(lat2))*Math.pow(Math.sin(Math.toRadians(lon2-lon1)/2),2);
        return 6371.0088*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));
    }
    public static List<Ranked> query(List<Spot> spots,String keyword,double lat,double lon,boolean sort) {
        String pattern=normalize(keyword.trim());int[] pi=prefix(pattern);List<Ranked> result=new ArrayList<>();
        for(int i=0;i<spots.size();i++) {
            Spot s=spots.get(i);
            // Match each field independently: a phrase must not cross the title/address boundary.
            if(containsKmp(normalize(s.title()),pattern,pi)||containsKmp(normalize(s.address()),pattern,pi))
                result.add(new Ranked(s,i,sort?distance(lat,lon,s.lat(),s.lon()):Double.NaN));
        }
        if(!sort) return result;
        Ranked[] a=result.toArray(Ranked[]::new);mergeSort(a);return Arrays.asList(a);
    }
    public static void mergeSort(Ranked[] a) { merge(a,new Ranked[a.length],0,a.length); }
    private static void merge(Ranked[] a,Ranked[] tmp,int lo,int hi) {
        if(hi-lo<2)return;int mid=(lo+hi)>>>1;merge(a,tmp,lo,mid);merge(a,tmp,mid,hi);
        int i=lo,j=mid,k=lo;
        while(i<mid&&j<hi) tmp[k++]=Double.compare(a[i].km(),a[j].km())<=0?a[i++]:a[j++];
        while(i<mid)tmp[k++]=a[i++];while(j<hi)tmp[k++]=a[j++];System.arraycopy(tmp,lo,a,lo,hi-lo);
    }
    public static void selectionSort(Ranked[] a) {
        for(int i=0;i<a.length;i++){int best=i;for(int j=i+1;j<a.length;j++)if(Double.compare(a[j].km(),a[best].km())<0)best=j;
            Ranked v=a[i];a[i]=a[best];a[best]=v;}
    }
}
