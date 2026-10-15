package enjoytrip;
import java.util.*;

public final class AlgorithmsTest {
    private static int checks;
    private static void check(boolean value,String message){checks++;if(!value)throw new AssertionError(message);}
    public static void main(String[] args){
        for(String text:List.of("","서울 종로구","aaaaab","여행😀서울","ABC abc","가나다가나다"))
            for(String p:List.of("","서울","😀","aaaaab","aaaaac","abc","가나다","longer than text"))
                check(Algorithms.containsKmp(text,p,Algorithms.prefix(p))==text.contains(p),"KMP edge case");
        Random r=new Random(16);
        for(int t=0;t<2000;t++){
            StringBuilder s=new StringBuilder(),p=new StringBuilder();for(int i=r.nextInt(100);i>0;i--)s.append("abc가나".charAt(r.nextInt(5)));for(int i=r.nextInt(20);i>0;i--)p.append("abc가나".charAt(r.nextInt(5)));
            check(Algorithms.containsKmp(s.toString(),p.toString(),Algorithms.prefix(p.toString()))==s.toString().contains(p),"random search");
        }
        for(int n:new int[]{0,1,2,3,10,100,1000}){
            var a=new Algorithms.Ranked[n];for(int i=0;i<n;i++)a[i]=new Algorithms.Ranked(new Algorithms.Spot(""+i,"","",0,0),i,r.nextInt(10));
            var expected=a.clone();Arrays.sort(expected,Comparator.comparingDouble(Algorithms.Ranked::km));Algorithms.mergeSort(a);
            check(Arrays.equals(a,expected),"stable sort n="+n);
        }
        var s=List.of(new Algorithms.Spot("1","Seoul Palace","종로구",37.579,126.977),new Algorithms.Spot("2","서울","강남구",37.5,127),new Algorithms.Spot("3","서울","종로",Double.NaN,0));
        check(Algorithms.query(s," SEOUL ",37.5,127,false).getFirst().spot().id().equals("1"),"case folding");
        check(Algorithms.query(s,"서울",37.5,127,true).getLast().km()==Double.POSITIVE_INFINITY,"missing coordinate last");
        check(Algorithms.query(s,"Palace종로",0,0,false).isEmpty(),"no field-boundary match");
        check(Algorithms.query(s,"",0,0,false).size()==3,"empty query");
        check(Algorithms.distance(37,127,37,127)==0,"zero distance");
        check(Math.abs(Algorithms.distance(0,0,0,1)-111.195)<0.01,"known great circle arc");
        check(Double.isInfinite(Algorithms.distance(91,0,0,0)),"invalid latitude");
        check(Math.abs(Algorithms.distance(37,126,35,129)-Algorithms.distance(35,129,37,126))<1e-8,"symmetry");
        check(Algorithms.validCoordinate(0,0),"zero coordinate valid");
        System.out.println("PASS: "+checks+" assertions (seed 16, reference checks and edge cases)");
    }
}
