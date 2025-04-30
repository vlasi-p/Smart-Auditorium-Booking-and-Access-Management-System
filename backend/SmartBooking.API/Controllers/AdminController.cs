using Microsoft.AspNetCore.Mvc;

namespace SmartBooking.API.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
