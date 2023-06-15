import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backgroundImage from '../../assets/images/background_4.jpg';
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import { User } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { FaUserCircle } from "react-icons/fa";
import { AuthService } from "../../services/auth.service";
import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next"
import './stats.page.css';
import { ActivityService } from "../../services/activity.service";
import { PublicationService } from "../../services/publication.service";
import { Bar } from 'react-chartjs-2';
import { ChartData, BarElement, Chart } from "chart.js";
import 'chart.js/auto';

Chart.register(BarElement);


const UserStats = () => {

  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [myId, setMyId] = useState<string>('1234');
  const [participatedActivities, setParticipatedActivities] = useState<number>(0);
  const [createdActivities, setCreatedActivities] = useState<number>(0);
  const [publications, setPublications] = useState<number>(0);
  const [numActivitiesWeek, setNumActivitiesWeek] = useState<number>(0);
  const [numActivitiesMonth, setNumActivitiesMonth] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartData<"bar", number[], unknown> | null>(null);
  const [options, setOptions] = useState({});
  const navigate = useNavigate();
  const {t} = useTranslation();

  useEffect(() => {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      const myUserId = AuthService.getCurrentUser();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const date = currentDate.toString();

      if(myUserId){
        setMyId(myUserId);
        console.log("Obtenemos los datos del otro usuario");
        //Obtenemos el usuario
        getById(myUserId);

        const fetchActivitiesParticipated = async () => {
            try {
              const participated = await activitiesParticipated(myUserId);
              setParticipatedActivities(participated);
              const created = await activitiesCreated(myUserId);
              setCreatedActivities(created);
              const numPublications = await publicationsMade(myUserId);
              setPublications(numPublications);
              const numWeek = await activitiesWeek(myUserId, date);
              console.log("numWeek",numWeek)
              setNumActivitiesWeek(numWeek);
              const numMonth = await activitiesMonth(myUserId, date);
              setNumActivitiesMonth(numMonth);
              const data = await last6Weeks(myUserId);
              const labelDays = daysOfWeek();
              const dataChart = {
                labels: [labelDays[0], labelDays[1], labelDays[2], labelDays[3], labelDays[4], labelDays[5]],
                datasets: [
                  {
                    label: 'Activities Participated',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                  },
                ],
              };
              const optionsChart = {
                scales: {
                  x: {
                    type: 'category',
                    title: {
                      display: true,
                      text: 'Categories'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Values'
                    }
                  }
                }
              };
              setChartData(dataChart);
              setOptions(optionsChart);



            } catch (error) {
              console.error('Error al obtener las actividades participadas:', error);
            }
          };
          fetchActivitiesParticipated();
      }

    }, []);


    const getById = async (myUserId: string) => {
        console.log("Obtenemos los datos del otro usuario:", myUserId);
        try {
            const response = await UserService.getPerson(myUserId ?? 'NoID');
            setCurrentUser(response.data);
            console.log("Obtenemos los datos del otro usuario: exito");
        } catch (error) {
            navigate("*");
            console.log("Obtenemos los datos del otro usuario: mal");
            console.error(error);

        }
    };

    const activitiesParticipated = async(myUserId: string) => {
        const response = await ActivityService.getAllActivitiesParticipatedByUser(myUserId);
        console.log(userId);
        console.log(response.data.length);
        return response.data.length;
    }

    const activitiesCreated = async(myUserId: string) => {
        const response = await ActivityService.getAllActivitiesCreatedByUser(myUserId);
        console.log(userId);
        console.log(response.data.length);
        return response.data.length;
    }

    const publicationsMade = async(myUserId: string) => {
        const response = await PublicationService.getAllPublicationByUser(myUserId);
        console.log(userId);
        console.log(response.data.length);
        return response.data.length;
    }

    const activitiesWeek = async(myUserId: string, date: string) => {
        const response = await ActivityService.getMySchedule(myUserId, date);
        console.log(userId);
        console.log(response.data.length);
        return response.data.length;
    }

    const activitiesMonth = async(myUserId: string, date: string) => {
        const response = await ActivityService.getActivitiesLastMonthByUser(myUserId, date);
        console.log(userId);
        console.log(response.data.length);
        return response.data.length;
    }

    const last6Weeks = async(myUserId: string) => {
        const response = await ActivityService.getActivitiesLast6Weeks(myUserId);
        console.log(userId);
        console.log(response.data);
        return response.data;
    }

    const daysOfWeek = () => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const dayOfWeek = currentDate.getDay();
        console.log("dayofWeek", dayOfWeek);
        // Ajustar el día de la semana
        const adjustedDayOfWeek = (dayOfWeek + 6) % 7; // Convertir domingo (0) a 6 y desplazar los demás días
        // Obtener el primer día (lunes) de la semana
        currentDate.setDate(currentDate.getDate() - adjustedDayOfWeek); //ponemos la currentDate a Lunes de la semana actual
        console.log("start of week", currentDate);
        const days: string[] = [];
        for (let i = 0; i < 6; i++) {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - i * 7); // Restar i semanas a la fecha actual
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            const startString = `${startOfWeek.getDate()} / ${startOfWeek.getMonth() + 1}`;
            const endString = `${endOfWeek.getDate()} / ${endOfWeek.getMonth() + 1}`;

            const weekRange = `${startString} - ${endString}`;
            days.push(weekRange);
          }
        return days;
    }


    return (
        <div>
            <Navbar/>
            <div className="titleContainer">
                <h1 className="titleSection">{t("Stats")}</h1>
            </div>
            <div className="user-profile">
                {currentUser ? (
                    <div className="profile">
                        <h1 className="profile-user-name">{currentUser.appUser}</h1>
                        <div className="profile-image">{currentUser.photoUser ? (<img src={currentUser.photoUser} alt="profile-img" className="profile-img-card" />) : (
                            <FaUserCircle className="default-profile-img" />
                            )}
                        </div>
                        <div className="user-stats">
                            <h1 className="profileTitle">{t("Followed")}</h1>
                            <h1 className="profile-stat-count"><Link  to={`/profile/userList/${currentUser.uuid}/followers`}>{currentUser.followersUser?.length}</Link></h1>
                            <h1 className="profileTitle">{t("Following")}</h1>
                            <h1 className="profile-stat-count"><Link  to={`/profile/userList/${currentUser.uuid}/following`}>{currentUser.followedUser?.length}</Link></h1>
                            <h1 className="userStat">Created Activities: {createdActivities}</h1>
                            <h1 className="userStat">Activities you participated: {participatedActivities}</h1>
                            <h1 className="userStat">Publications made: {publications}</h1>
                            <h1 className="userStat">Activities this week: {numActivitiesWeek}</h1>
                            <h1 className="userStat">Activities last month: {numActivitiesMonth}</h1>
                            {chartData && (
                                <div className="chart-container">
                                    <h2 className="chart-title">Activities Participated Last 6 Weeks</h2>
                                    <Bar data={chartData} options={options}/>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>{t("Loading")}</p>
                )}
            </div>
            <Footer/>
        </div>
    );


};

export default UserStats;